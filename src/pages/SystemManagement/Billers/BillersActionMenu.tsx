import React, { useCallback, useRef, useState } from 'react';
import { CircularProgress, IconButton, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useAuthService from 'hooks/useAuthService';
import { CancelIcon, CheckCircleIcon, EditIcon, MoreVertIcon } from 'components/appIcons';
import { IBiller } from './Billers.model';

interface IBillersActionMenuProps {
  billerID: number;
  biller: IBiller;
  doActivateBiller: (billerID: number) => Promise<unknown>;
  doDeactivateBiller: (billerID: number) => Promise<unknown>;
  triggerEditBiller: (biller: IBiller) => void;
}

const BillersActionMenu: React.FC<IBillersActionMenuProps> = (props) => {
  const { billerID, biller, doActivateBiller, doDeactivateBiller, triggerEditBiller } = props;
  const { isISWUser } = useAuthService();
  const { t } = useTranslation();
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const closeOptions = useCallback(() => setIsOpen(false), []);

  const activate = useCallback(() => {
    setToggling(true);
    doActivateBiller(billerID).finally(() => setToggling(false));
  }, [billerID, doActivateBiller]);

  const deactivate = useCallback(() => {
    setToggling(true);
    doDeactivateBiller(billerID).finally(() => setToggling(false));
  }, [billerID, doActivateBiller]);

  const editBiller = useCallback(() => {
    triggerEditBiller(biller);
    setIsOpen(false);
  }, [biller]);

  if (!isISWUser) return null;

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <MoreVertIcon />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={closeOptions}
        PaperProps={{
          sx: { width: 250, maxWidth: '100%' },
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={editBiller}>
          <EditIcon /> {t('labels:edit')}
        </MenuItem>

        {biller.status ? (
          <MenuItem sx={{ color: 'error.main' }} onClick={deactivate} disabled={toggling}>
            {toggling ? <CircularProgress size={14} /> : <CancelIcon />} {t('labels:deactivate')}
          </MenuItem>
        ) : (
          <MenuItem sx={{ color: 'success.main' }} onClick={activate} disabled={toggling}>
            {toggling ? <CircularProgress size={14} /> : <CheckCircleIcon />} {t('labels:activate')}
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default BillersActionMenu;
