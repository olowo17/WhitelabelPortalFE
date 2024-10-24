import { IApiResponse } from 'models';

export interface IDevice {
  activationCompleted: string;
  activationStarted: string;
  customerUsername: string;
  institutionCode: string;
  deviceID: number;
  deviceState: string;
  model: string;
  name: string;
  enabled: boolean;
}

export interface IGetDevicesReturn {
  code: number;
  description: string;
  devices: IDevice[];
  totalRecordCount: number;
}

export interface IGetDevicesBody {
  pageNumber: number;
  pageSize?: number;
  customerNumber?: string;
  username?: string;
  accountNumber?: string;
  startDate?: string;
  endDate?: string;
}

export interface ISearchDevices {
  startDate: string;
  endDate: string;
  customerNumber?: string;
  username?: string;
  accountNumber?: string;
}

export type IDeviceAction = (deviceID: number) => Promise<IApiResponse>;
export type IDoDeviceAction = (targetDevice: IDevice) => Promise<void>;
