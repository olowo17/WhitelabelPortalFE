import api from 'api/api';
import {
  ICreateInfosBody,
  IGetInfosData,
  IGetInfoTypesData,
  IUpdateInfosBody,
  IUpdateInfosData,
} from './Information.model';

export const getInfos = () => {
  return api.get<unknown, IGetInfosData>('information', { urlEncoded: true });
};

export const createInfo = (body: ICreateInfosBody) => {
  return api.post<unknown, IUpdateInfosData>('information', body);
};

export const updateInfo = (body: IUpdateInfosBody) => {
  return api.put<unknown, IUpdateInfosData>('information/', body);
};

export const getInfoTypes = () => api.get<unknown, IGetInfoTypesData>('information/types', { urlEncoded: true });
