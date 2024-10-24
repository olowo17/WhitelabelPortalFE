import api from 'api/api';
import { IApiResponse } from 'models';
import { ISearchGlobalLimit, ISearchGlobalLimitReturn, IUpdateGlobalLimit } from './GlobalLimits.model';

export const searchGlobalLimit = (body: ISearchGlobalLimit) =>
  api.post<unknown, ISearchGlobalLimitReturn>('limit/global/search', body, { urlEncoded: true });

export const updateGlobalLimit = (body: IUpdateGlobalLimit) =>
  api.post<unknown, IApiResponse>('pending/request/submit/edit-kyc-level-limit', body);
