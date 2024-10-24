import api from 'api/api';
import { IApiResponse } from 'models';
import { ICreateBiller, IGetBillersBody, IGetBillersData, IGetFilteredBillers, IUpdateBiller } from './Billers.model';

export const getBillers = (body: IGetBillersBody) =>
  api.post<unknown, IGetBillersData>('system/billers/search', body, { urlEncoded: true });

export const getAllBillers = () => api.get<unknown, IGetBillersData>('system/billers');

export const createBiller = (biller: ICreateBiller) =>
  api.post<unknown, IApiResponse>('system/biller/create/initiate', biller);

export const updateBiller = (biller: IUpdateBiller) =>
  api.put<unknown, IApiResponse>('system/biller/edit/initiate', biller);

export const activateBiller = (billerID: number) =>
  api.post<unknown, IApiResponse>(`system/biller/${billerID}/enable/initiate`, null, { urlEncoded: true });

export const deactivateBiller = (billerID: number) =>
  api.post<unknown, IApiResponse>(`system/biller/${billerID}/disable/initiate`, null, { urlEncoded: true });

export const getFilteredBillers = (institutionCode: string) =>
  api.get<unknown, IGetFilteredBillers>(`system/filteredBiller?institutionCode=${institutionCode}`, {
    urlEncoded: true,
  });

export const addFilteredBiller = (billerID: number, institutionCode: string) =>
  api.post<unknown, IApiResponse>(`system/biller/institution/${billerID}/${institutionCode}/add/initiate`, null, {
    urlEncoded: true,
  });

export const removeFilteredBiller = (billerID: number, institutionCode: string) =>
  api.post<unknown, IApiResponse>(`system/biller/institution/${billerID}/${institutionCode}/delete/initiate`, null, {
    urlEncoded: true,
  });
