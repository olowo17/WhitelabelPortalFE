export interface ISearchTransactions {
  institutionCode: string;
  filterKey?: string;
  filterValue?: string;
  transTypeCode: string;
  channel: string;
  transRef?: string;
  sourceAccount?: string;
  startDate: string;
  endDate: string;
}

export interface ISearchTransactionsBody extends ISearchTransactions {
  pageNumber: number;
  pageSize?: number;
}

export interface ITransactionType {
  code: string;
  name: string;
}

export interface IGetTransactionTypesReturn {
  code: number;
  description: string | null;
  transactionTypes: ITransactionType[];
}

export interface IGetTransactionChannelsReturn {
  code: number;
  description: string;
  totalRecordCount: number;
  channels: string[];
}

export interface ITransaction {
  accountName: string;
  additionalParams: Record<string, string>;
  // additionalParams: Record<string, string | null>;
  amount: number;
  date: string;
  destinationAccountOrMobileNumber: string;
  destinationBankCode: string;
  destinationBankName: string | null;
  responseCode: string;
  responseDescription: string | null;
  sourceAccount: string;
  status: string;
  transactionID: number;
  transactionReference: string | null;
  transactionType: string;
  transactionChannel: string;
}

export interface IGetTransactionsReturn {
  code: number;
  description: string | null;
  totalRecordCount: number;
  transactions: ITransaction[];
}

export enum TransactionsStatuses {
  Success = 'Success',
  Failed = 'Failed',
  PENDING = 'PENDING',
  REVERSED = 'REVERSED',
}
