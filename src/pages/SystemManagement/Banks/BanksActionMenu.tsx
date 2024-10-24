import React, { useCallback, useRef, useState } from 'react';
import { CircularProgress, IconButton, Menu, MenuItem, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useAuthService from 'hooks/useAuthService';
import { CancelIcon, CheckCircleIcon, EditIcon, MoreVertIcon } from 'components/appIcons';
import { IBank } from './Banks.model';

interface IBankActionMenuProps {
  bankID: number;
  bank: IBank;
  updateFiltered: (bankID: number, filtered: boolean) => Promise<unknown>;
  doActivateBank: (bankID: number) => Promise<unknown>;
  doDeactivateBank: (bankID: number) => Promise<unknown>;
  triggerEditBank: (bank: IBank) => void;
}

const BanksActionMenu: React.FC<IBankActionMenuProps> = (props) => {
  const { bankID, bank, updateFiltered, doActivateBank, doDeactivateBank, triggerEditBank } = props;
  const { isISWUser } = useAuthService();
  const { t } = useTranslation();
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [savingFiltered, setSavingFiltered] = useState(false);
  const [enabling, setEnabling] = useState(false);

  const closeOptions = useCallback(() => setIsOpen(false), []);

  const handleFilteredToggle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();

      const filtered = !event.target.checked;

      setSavingFiltered(true);
      updateFiltered(bankID, filtered).finally(() => setSavingFiltered(false));
    },
    [bankID, updateFiltered]
  );

  const enable = useCallback(() => {
    setEnabling(true);
    doActivateBank(bankID).finally(() => setEnabling(false));
  }, [bankID, doActivateBank]);

  const disable = useCallback(() => {
    setEnabling(true);
    doDeactivateBank(bankID).finally(() => setEnabling(false));
  }, [bankID, doActivateBank]);

  const editBank = useCallback(() => {
    triggerEditBank(bank);
    setIsOpen(false);
  }, [bank, triggerEditBank]);

  return isISWUser ? (
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
        <MenuItem onClick={editBank}>
          <EditIcon /> {t('labels:edit')}
        </MenuItem>

        {bank.status ? (
          <MenuItem sx={{ color: 'error.main' }} onClick={disable} disabled={enabling}>
            {enabling ? <CircularProgress size={14} /> : <CancelIcon />} {t('labels:disable')}
          </MenuItem>
        ) : (
          <MenuItem sx={{ color: 'success.main' }} onClick={enable} disabled={enabling}>
            {enabling ? <CircularProgress size={14} /> : <CheckCircleIcon />} {t('labels:enable')}
          </MenuItem>
        )}
      </Menu>
    </>
  ) : (
    <>
      <Switch checked={!bank.filtered} onChange={handleFilteredToggle} disabled={savingFiltered} />
      {savingFiltered && <CircularProgress size={20} style={{ verticalAlign: 'middle' }} />}
    </>
  );
};

export default BanksActionMenu;
