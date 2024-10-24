import api from 'api/api';
import { IApiResponse } from 'models';
import { IGetDevicesBody, IGetDevicesReturn } from './Devices.model';

export const getDevices = (body: IGetDevicesBody) => {
  return api.post<unknown, IGetDevicesReturn>('device/list', body, { urlEncoded: true }).then((res) => res);
};

export const activateDevice = (deviceID: number) => {
  return api
    .post<unknown, IApiResponse>('device/' + deviceID + '/enable/initiate', null, { urlEncoded: true })
    .then((res) => res);
};

export const deactivateDevice = (deviceID: number) => {
  return api
    .post<unknown, IApiResponse>('device/' + deviceID + '/disable', null, { urlEncoded: true })
    .then((res) => res);
};

export const releaseDevice = (deviceID: number) => {
  return api
    .post<unknown, IApiResponse>('device/' + deviceID + '/release/initiate', null, { urlEncoded: true })
    .then((res) => res);
};
