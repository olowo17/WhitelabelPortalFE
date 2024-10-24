import api from 'api/api';
import {
  IGetTransactionChannelsReturn,
  IGetTransactionTypesReturn,
  IGetTransactionsReturn,
  ISearchTransactions,
  TransactionsStatuses,
} from './Transactions.model';

export const getTransactionTypes = () => api.get<unknown, IGetTransactionTypesReturn>('transactions/transactionTypes');

export const getTransactionChannels = () =>
  api.get<unknown, IGetTransactionChannelsReturn>('transactions/transactionChannels');

export const getFilterParams = () => api.get('transaction/filterParams');

export const getTransactions = (body: ISearchTransactions) =>
  api.post<unknown, IGetTransactionsReturn>('transactions/search', body, { urlEncoded: true });

// export const searchCustomerLimit = (body: ISearchCustomerLimit) =>
//   api.post<unknown, ISearchCustomerLimitReturn>('limit/customer/search', body, { urlEncoded: true });

export const getTransactionColor = (status: TransactionsStatuses) => {
  switch (status) {
    case TransactionsStatuses.Failed:
      return 'error';
    case TransactionsStatuses.Success:
      return 'success';
    case TransactionsStatuses.PENDING:
    case TransactionsStatuses.REVERSED:
    default:
      return 'warning';
  }
};
