import { MutateData } from 'models';

export interface IRequestType {
  key: string;
  value: string;
}

export interface IRequestTypesReturn {
  code: number;
  description: string | null;
  totalRecordCount: number;
  types: IRequestType[];
}

export interface IPendingRequest {
  actionOn: string;
  additionalInfo: string;
  // branch: {...}
  description: string;
  requestDate: string;
  requestID: string;
  requestKey: string;
  requestType: string;
  requestorEmaill: string;
  requestorUsername: string;
  status: string;
  // portalAction: boolean;
}

export interface IGetPendingRequestsReturn {
  code: number;
  description: string | null;
  requests: IPendingRequest[];
  totalRecordCount: number;
}

export interface IGetPendingRequestsBody {
  pageNumber: number;
  pageSize?: number;
  requestType?: string;
  startDate?: string;
  endDate?: string;
}

export interface IRequestResponse {
  code: number;
  description?: string;
}

export type MakeRequest = (requestId: string) => Promise<IRequestResponse>;

export type MakePortalRequest = (body: { requestId: string }) => Promise<MutateData>;

export enum RequestsStatuses {
  PENDING = 'PENDING',
}
