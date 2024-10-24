export interface ICustomerLimit {
  amount: number;
  customerID: string | number | null;
  name: string;
}

export interface ICustomerInfo {
  counter: number;
  customerID: number;
  customerName: string;
  customerNumber: string | number;
  enabled: boolean;
  primaryAccountNumber: string | number;
  regCompleted: string;
  regStarted: string;
  regStatus: string;
  transactional: boolean;
  username: string;
}

export interface ISearchCustomerLimit {
  institutionCode: string;
  accountNumber?: string;
  customerNumber?: string;
  username?: string;
}

export interface ISearchCustomerLimitBody extends ISearchCustomerLimit {
  pageNumber: number;
  pageSize: number;
}

export interface ISearchCustomerLimitReturn {
  code: number;
  customerInfo: ICustomerInfo;
  description: string;
  limits: ICustomerLimit[];
}

export interface IUpdateCustomerLimit {
  amount: number;
  name: string;
}
