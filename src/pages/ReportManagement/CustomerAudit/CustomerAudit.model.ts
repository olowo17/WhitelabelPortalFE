export interface ICustomerAudit {
  accountNumber: string;
  currentLimit: string | number | null;
  customerNumber: string;
  dateCreated: string;
  deviceType: string;
  email: string;
  methodName: string;
  newLimit: string | number | null;
  osType: string;
  phoneNumber: string;
  status: string;
  username: string;
}

export interface IGetCustomerAuditsReturn {
  code: number;
  description: string;
  totalRecordCount: number;
  customerAuditInfos: ICustomerAudit[];
}

export interface ISearchCustomerAudits {
  startDate: string;
  endDate: string;
  accountNumber?: string;
  customerNumber?: string;
  username?: string;
  methodName?: string;
}

export interface IGetCustomerAuditsBody extends ISearchCustomerAudits {
  pageNumber: number;
  pageSize: number;
}

export interface IGetCustomerAuditsTypes {
  code: number;
  description: string;
  data: string[];
}

export enum CustomerAuditsStatuses {
  Success = 'Success',
  Failed = 'Failed',
}
