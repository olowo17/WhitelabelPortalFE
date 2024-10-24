import { gql } from '@apollo/client';
import api from 'api/api';
import { AuditReportStatuses, ISearchAuditReportBody, ISearchAuditReportReturn } from './AuditReport.model';

export const GET_AUDITS_QUERY = gql`
  query AuditTrail($input: AuditTrailInput!) {
    auditTrail(input: $input) {
      count
      rows {
        id
        createDate
        auditType
        details
        actionOn
        actionBy
        status
        sourceAccount
        userIp
      }
    }
  }
`;

// export const getAuditReports = (body: ISearchAuditReportBody) =>
//   gqlc.query<{ auditTrail: ISearchAuditReportReturn }>(GET_AUDITS_QUERY, body).then((res) => res.auditTrail);

export const getAuditReports = (body: ISearchAuditReportBody) =>
  api.post<unknown, ISearchAuditReportReturn>('customerAudit/report', body, { urlEncoded: true });

export const getAuditReportColor = (status: AuditReportStatuses) => {
  switch (status) {
    case AuditReportStatuses.DECLINED:
      return 'error';
    case AuditReportStatuses.APPROVED:
      return 'success';
    case AuditReportStatuses.PENDING:
    default:
      return 'warning';
  }
};
