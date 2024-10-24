export interface ILoggedCustomer {
  counter: number;
  customerID: number;
  customerName: string;
  enabled: boolean;
  lastLogin: string;
  mobileNumber: string;
  primaryAccountNumber: string;
  regStarted: string;
  regStatus: string;
  transactional: boolean;
  username: string;
}

export interface ILoggedCustomersValues {
  date: string;
  institutionCode: string;
}

export interface IGetLoggedCustomersBody extends ILoggedCustomersValues {
  pageNumber: number;
  pageSize: number;
}

export interface IGetLoggedCustomersReturn {
  code: 0;
  description: null;
  totalRecordCount: number;
  customers: ILoggedCustomer[];
}
