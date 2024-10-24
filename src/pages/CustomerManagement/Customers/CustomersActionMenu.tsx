import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircularProgress, IconButton, Menu, MenuItem } from '@mui/material';
import { RecordValue } from 'components/AppTable';
import {
  AttachMoneyIcon,
  InfoIcon,
  LockOpenIcon,
  MoneyOffIcon,
  MoreVertIcon,
  PersonIcon,
  PersonOffIcon,
  RotateLeftIcon,
} from 'components/appIcons';
import { ICustomer } from './Customers.model';

interface CustomersActionMenuProps {
  id: RecordValue;
  customer: ICustomer;
  viewCustomer: (customer: ICustomer) => void;
  doDeactivateCustomer: (customerID: number) => void;
  doActivateCustomer: (customerID: number) => Promise<unknown>;
  doToggleTransactional: (customerID: number) => Promise<unknown>;
  doReleaseCustomer: (customerID: number) => Promise<unknown>;
  doResetCounter: (customerID: number) => Promise<unknown>;
  doKycOpen: (customer: ICustomer) => void;
}

const CustomersActionMenu: React.FC<CustomersActionMenuProps> = (props) => {
  const {
    customer,
    viewCustomer,
    doDeactivateCustomer,
    doActivateCustomer,
    doToggleTransactional,
    doReleaseCustomer,
    doResetCounter,
  } = props;
  const { t } = useTranslation();

  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activating, setActivating] = useState(false);
  const [trnToggling, setTrnToggling] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [resetting, setResetting] = useState(false);

  const closeOptions = useCallback(() => setIsOpen(false), []);

  const viewCustomerDetails = useCallback(() => viewCustomer(customer), [customer, viewCustomer]);

  const deactivate = useCallback(
    () => doDeactivateCustomer(customer.customerID),
    [doDeactivateCustomer, customer.customerID]
  );

  const activate = useCallback(() => {
    setActivating(true);
    doActivateCustomer(customer.customerID).finally(() => setActivating(false));
  }, [doDeactivateCustomer, customer.customerID]);

  const toggleTransactional = useCallback(() => {
    setTrnToggling(true);
    doToggleTransactional(customer.customerID).finally(() => setTrnToggling(false));
  }, [customer.customerID, doToggleTransactional]);

  const release = useCallback(() => {
    setReleasing(true);
    doReleaseCustomer(customer.customerID).finally(() => setReleasing(false));
  }, [doReleaseCustomer, customer.customerID]);

  const counterReset = useCallback(() => {
    setResetting(true);
    doResetCounter(customer.customerID).finally(() => setResetting(false));
  }, [doResetCounter, customer.customerID]);

  // const kycOpen = useCallback(() => doKycOpen(customer), [doKycOpen, customer]);

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
        <MenuItem onClick={viewCustomerDetails}>
          <InfoIcon /> {t('labels:details')}
        </MenuItem>

        {customer.enabled ? (
          <MenuItem sx={{ color: 'error.main' }} onClick={deactivate}>
            <PersonOffIcon /> {t('labels:deactivate')}
          </MenuItem>
        ) : (
          <MenuItem sx={{ color: 'success.main' }} onClick={activate} disabled={activating}>
            {activating ? <CircularProgress size={14} /> : <PersonIcon />} {t('labels:activate')}
          </MenuItem>
        )}

        <MenuItem onClick={release} disabled={releasing}>
          {releasing ? <CircularProgress size={14} /> : <LockOpenIcon />} {t('labels:release')}
        </MenuItem>

        <MenuItem onClick={toggleTransactional} disabled={trnToggling}>
          {trnToggling ? (
            <CircularProgress size={14} />
          ) : customer.transactional ? (
            <MoneyOffIcon />
          ) : (
            <AttachMoneyIcon />
          )}
          {customer.transactional ? t('labels:deactivate') : t('labels:activate')} {t('labels:transactional')}
        </MenuItem>

        {/* <MenuItem onClick={kycOpen}>
          <UpgradeIcon /> {t('labels:upgradeKyc')}
        </MenuItem> */}

        <MenuItem onClick={counterReset} disabled={resetting}>
          {resetting ? <CircularProgress size={14} /> : <RotateLeftIcon />} {t('labels:resetCounter')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default CustomersActionMenu;
