import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { ReadMoreIcon } from 'components/appIcons';
import AppModal from 'components/AppModal';
import { RecordValue } from 'components/AppTable';
import TransactionDetails from './TransactionDetails';
import { ITransaction } from './Transactions.model';

interface ITransactionsActionMenuProps {
  id: RecordValue;
  transaction: ITransaction;
}

const TransactionsActionMenu = ({ transaction }: ITransactionsActionMenuProps) => {
  const { t } = useTranslation();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleOpenDetails = useCallback(() => {
    setIsDetailsOpen(true);
  }, []);
  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
  }, []);

  const modalTitle = useMemo(
    () => `${t('labels:viewMoreDetailsAbout')} ${transaction.transactionType}`,
    [transaction.transactionType]
  );

  return (
    <>
      <Button onClick={handleOpenDetails} startIcon={<ReadMoreIcon />} sx={{ color: 'info.main' }}>
        {t('labels:details')}
      </Button>

      <AppModal title={modalTitle} open={isDetailsOpen} onClose={handleCloseDetails} size="md">
        <TransactionDetails transaction={transaction}></TransactionDetails>
      </AppModal>
    </>
  );
};

export default TransactionsActionMenu;
