import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, IconButton, MenuItem, CircularProgress } from '@mui/material';
import { CancelOutlinedIcon, CheckCircleOutlinedIcon, LaunchIcon, MoreVertIcon } from 'components/appIcons';
import { IDevice, IDoDeviceAction } from './Devices.model';

interface IDevicesActionMenu {
  device: IDevice;
  doActivateDevice: IDoDeviceAction;
  doDeactivateDevice: IDoDeviceAction;
  doReleaseDevice: IDoDeviceAction;
}

const DevicesActionMenu: React.FC<IDevicesActionMenu> = ({
  device,
  doActivateDevice,
  doDeactivateDevice,
  doReleaseDevice,
}) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const toggleDeviceStatus = useCallback(() => {
    setTogglingStatus(true);
    (device.enabled ? doDeactivateDevice(device) : doActivateDevice(device)).finally(() => setTogglingStatus(false));
  }, [doActivateDevice, doDeactivateDevice, device]);

  const releaseDevice = useCallback(() => {
    doReleaseDevice(device); // add toast
  }, [device]);

  const handleOpenMenu = useCallback(() => {
    setIsOpen(true);
  }, []);
  const handleCloseMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <IconButton ref={ref} onClick={handleOpenMenu}>
        <MoreVertIcon />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' },
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          sx={{ color: device.enabled ? 'error.main' : 'success.main' }}
          onClick={toggleDeviceStatus}
          disabled={togglingStatus}
        >
          {togglingStatus ? (
            <CircularProgress size={14} />
          ) : device.enabled ? (
            <CancelOutlinedIcon />
          ) : (
            <CheckCircleOutlinedIcon />
          )}
          {device.enabled ? t('labels:deactivate') : t('labels:activate')}
        </MenuItem>
        <MenuItem onClick={releaseDevice}>
          <LaunchIcon />
          {t('labels:release')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default DevicesActionMenu;
