export interface IAuditReport {
  accountNumber: string;
  actionBy: string;
  actionOn: string;
  auditType: string;
  createDate: string;
  customerName: string;
  details: string;
  id: number;
  institutionId: number;
  status: string;
  userIp: string;
}

export interface ISearchAuditReport {
  actionOn?: string;
  actionBy?: string;
  sourceAccount?: string;
  auditType?: string;
  startDate: string;
  endDate: string;
}

export interface ISearchAuditReportBody extends ISearchAuditReport {
  pageNumber: number;
  pageSize?: number;
}

export interface ISearchAuditReportReturn {
  code: number;
  description: string | null;
  auditTrails: IAuditReport[];
  totalRecordCount: number;
}

export enum AuditReportStatuses {
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
}
