export interface ICustomer {
  customerID: number;
  customerName: string;
  enabled: boolean;
  kycLevel: number;
  mobileNumber: string;
  primaryAccountNumber: string;
  regCompleted: number;
  regStarted: number;
  regStatus: string;
  username: string;
  transactional: boolean;
  counter: number;
  customerNumber: string | number;
  institutionCode: string;
  lastLogin: string;
  additionalParams: Record<string, string>;
}

export interface ISearchCustomers {
  institutionCode: string;
  regStatus: string;
  startDate: string;
  endDate: string;
  accountNumber?: string;
  customerNumber?: string | number;
  username?: string;
}

export interface IGetCustomersBody {
  pageNumber: number;
  pageSize: number;
  institutionCode: string;
  regStatus: string;
  accountNumber?: string;
  customerNumber?: string | number;
  username?: string;
  startDate?: string;
  endDate?: string;
}

export interface IGetCustomersData {
  code: number;
  description: string;
  customers: ICustomer[];
  totalRecordCount: number;
}

export interface IRegStatus {
  code: string;
  name: string;
}

export interface IGetRegStatusData {
  code: number;
  description: string;
  regStatuses: IRegStatus[];
}

export interface ISearchCustomerBody {
  pageNumber?: number;
  pageSize?: number;
  customerID?: string;
  accountNumber?: string;
  startDate?: string;
  endDate?: string;
}

export interface ISearchCustomerData {
  code: number;
  description: string;
  customer: ICustomer;
  totalRecordCount: number;
}

export interface IKycUpgradeBody {
  customerNumber: string | number;
  canTransact: boolean;
  kycLevel: number;
}
