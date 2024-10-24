import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircularProgress, Menu, IconButton, MenuItem } from '@mui/material';
import { EditIcon, MoreVertIcon, PersonIcon, PersonOffIcon } from 'components/appIcons';
import { RecordValue } from 'components/AppTable';
import { IBranch } from './Branches.model';

interface IBranchesActionMenu {
  id: RecordValue;
  branch: IBranch;
  triggerEditBranch: (branch: IBranch) => void;
  doActivateBranch: (branch: IBranch) => Promise<void>;
  doDeactivateBranch: (branch: IBranch) => Promise<void>;
}

const BranchesActionMenu: React.FC<IBranchesActionMenu> = ({
  branch,
  triggerEditBranch,
  doActivateBranch,
  doDeactivateBranch,
}) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const doEditBranch = useCallback(() => {
    triggerEditBranch(branch);
  }, [triggerEditBranch, branch]);

  const toggleBranchStatus = useCallback(() => {
    setTogglingStatus(true);
    (branch.activeStatus ? doDeactivateBranch(branch) : doActivateBranch(branch)).finally(() =>
      setTogglingStatus(false)
    );
  }, [doActivateBranch, doDeactivateBranch, branch]);
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
          sx={{ color: branch.activeStatus ? 'error.main' : 'success.main' }}
          onClick={toggleBranchStatus}
          disabled={togglingStatus}
        >
          {togglingStatus ? <CircularProgress size={14} /> : branch.activeStatus ? <PersonOffIcon /> : <PersonIcon />}
          {branch.activeStatus ? t('labels:deactivate') : t('labels:activate')}
        </MenuItem>

        <MenuItem onClick={doEditBranch}>
          <EditIcon /> {t('labels:edit')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default BranchesActionMenu;
