export interface IResetPin {
  accountNumber: string;
}

export interface ISearchPinForm {
  customerNumber?: string;
  username?: string;
  accountNumber?: string;
}

export interface ISearchPin extends ISearchPinForm {
  pageNumber: number;
  pageSize?: number;
}

export interface IPinCustomer {
  customerName: string;
  primaryAccountNumber: string;
  username: string;
}

export interface ISearchPinReturn {
  code: number;
  customer: IPinCustomer;
  description: string | null;
}
