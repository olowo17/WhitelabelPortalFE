import api from 'api/api';
import {
  CustomerAuditsStatuses,
  IGetCustomerAuditsBody,
  IGetCustomerAuditsReturn,
  IGetCustomerAuditsTypes,
} from './CustomerAudit.model';

export const getCustomerAudits = (body: IGetCustomerAuditsBody) =>
  api.post<unknown, IGetCustomerAuditsReturn>('customerAudit/list', body, { urlEncoded: true });

export const getCustomerAuditTypes = () => api.get<unknown, IGetCustomerAuditsTypes>('customerAudit/getTypes');

export const getCustomerAuditColor = (status: CustomerAuditsStatuses) => {
  switch (status) {
    case CustomerAuditsStatuses.Failed:
      return 'error';
    case CustomerAuditsStatuses.Success:
      return 'success';
    default:
      return 'warning';
  }
};
