import api from 'api/api';
import { IApiResponse } from 'models';
import { ICreateConfig, IGetConfigsBody, IGetConfigsReturn, IUpdateConfig } from './AppConfigs.model';

export const getConfigs = (body: IGetConfigsBody) =>
  api.post<unknown, IGetConfigsReturn>('config/search', body, { urlEncoded: true });

export const createConfig = (body: ICreateConfig) => api.post<unknown, IApiResponse>('config', body);

export const updateConfig = (body: IUpdateConfig) => api.put<unknown, IApiResponse>('config', body);
