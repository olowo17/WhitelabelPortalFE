import React, { useCallback, useRef, useState } from 'react';
import { CircularProgress, IconButton, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EditIcon, MoreVertIcon, PersonIcon, PersonOffIcon } from 'components/appIcons';
import { RecordValue } from 'components/AppTable';
import { IPortalUser } from './Users.model';

interface IUsersActionMenuProps {
  id: RecordValue;
  user: IPortalUser;
  triggerEditUser: (user: IPortalUser) => void;
  doActivateUser: (user: IPortalUser) => Promise<void>;
  doDeactivateUser: (user: IPortalUser) => Promise<void>;
}

const UsersActionMenu: React.FC<IUsersActionMenuProps> = (props) => {
  const { user, triggerEditUser, doActivateUser, doDeactivateUser } = props;
  const { t } = useTranslation();

  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const doEditUser = useCallback(() => {
    triggerEditUser(user);
  }, [triggerEditUser, user]);

  const toggleUserStatus = useCallback(() => {
    setTogglingStatus(true);
    (user.status ? doDeactivateUser(user) : doActivateUser(user)).finally(() => setTogglingStatus(false));
  }, [doActivateUser, doDeactivateUser, user]);

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <MoreVertIcon />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' },
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          sx={{ color: user.status ? 'error.main' : 'success.main' }}
          onClick={toggleUserStatus}
          disabled={togglingStatus}
        >
          {togglingStatus ? <CircularProgress size={14} /> : user.status ? <PersonOffIcon /> : <PersonIcon />}
          {user.status ? t('labels:deactivate') : t('labels:activate')}
        </MenuItem>

        <MenuItem onClick={doEditUser}>
          <EditIcon /> {t('labels:edit')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default UsersActionMenu;
