import api from 'api/api';
import {
  IGetPendingRequestsBody,
  IGetPendingRequestsReturn,
  IRequestResponse,
  IRequestTypesReturn,
} from './PendingRequests.model';

export const getPendingRequests = (body: IGetPendingRequestsBody = { pageNumber: 1, pageSize: 10 }) =>
  api.post<unknown, IGetPendingRequestsReturn>('pending/list', body, { urlEncoded: true }).then((res) => res);

export const getRequestTypes = () =>
  api.get<unknown, IRequestTypesReturn>('pending/request/types', { urlEncoded: true }).then((res) => res);

export const approveRequest = (requestId: string) =>
  api.post<unknown, IRequestResponse>(`pending/request/${requestId}/approve`).then((res) => res);

export const declineRequest = (requestId: string) =>
  api.post<unknown, IRequestResponse>(`pending/request/${requestId}/decline`).then((res) => res);
