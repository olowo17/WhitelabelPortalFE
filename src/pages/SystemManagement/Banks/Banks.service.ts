import api from 'api/api';
import { IApiResponse } from 'models';
import { ICreateBank, IGetBanksBody, IGetBanksData, IUpdateBank } from './Banks.model';

export const getBanks = (body: IGetBanksBody) =>
  api.post<unknown, IGetBanksData>('system/banks/search', body, { urlEncoded: true });

export const createBank = (body: ICreateBank) => api.post<unknown, IApiResponse>('system/bank/create/initiate', body);

export const updateBank = (body: IUpdateBank) => api.put<unknown, IApiResponse>('system/bank/edit/initiate', body);

export const activateBank = (bankID: number) =>
  api.post<unknown, IApiResponse>('system/bank/' + bankID + '/enable/initiate', null, { urlEncoded: true });

export const deactivateBank = (bankID: number) =>
  api.post<unknown, IApiResponse>('system/bank/' + bankID + '/disable/initiate', null, { urlEncoded: true });

export const toggleFiltered = (bankID: number, filteredOut: boolean) =>
  api.post<unknown, IApiResponse>(
    filteredOut
      ? 'system/bank/' + bankID + '/add-filter/initiate'
      : 'system/bank/' + bankID + '/remove-filter/initiate',
    null,
    { urlEncoded: true }
  );
