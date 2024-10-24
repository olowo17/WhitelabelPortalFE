export interface IResetPassword {
  accountNumber: string;
}

export interface ISearchPasswordForm {
  customerNumber?: string;
  username?: string;
  accountNumber?: string;
}

export interface ISearchPassword extends ISearchPasswordForm {
  pageNumber: number;
  pageSize?: number;
}

export interface IPasswordCustomer {
  customerName: string;
  primaryAccountNumber: string;
  username: string;
}

export interface ISearchPasswordReturn {
  code: number;
  customer: IPasswordCustomer;
  description: string | null;
}
