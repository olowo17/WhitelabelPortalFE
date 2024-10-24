import api from 'api/api';
import { IApiResponse } from 'models';
import {
  IGetCustomersBody,
  IGetCustomersData,
  IGetRegStatusData,
  IKycUpgradeBody,
  ISearchCustomerBody,
  ISearchCustomerData,
} from './Customers.model';

export const getCustomers = (body: IGetCustomersBody) =>
  api.post<unknown, IGetCustomersData>('customer/list', body, { urlEncoded: true });

export const searchCustomer = (body: ISearchCustomerBody) =>
  api.post<unknown, ISearchCustomerData>('customer/search', body, { urlEncoded: true });

export const getRegistrationStatuses = () => api.get<unknown, IGetRegStatusData>('customer/registrationStatus');

export const activateCustomer = (customerId: number) =>
  api.post<unknown, IApiResponse>('customer/' + customerId + '/enable/initiate', null, { urlEncoded: true });

export const deactivateCustomer = (customerId: number, reason: string) =>
  api.post<unknown, IApiResponse>('customer/' + customerId + '/disable', { reason }, { urlEncoded: true });

export const releaseCustomer = (customerId: number) =>
  api.post<unknown, IApiResponse>('customer/' + customerId + '/release/initiate', null, { urlEncoded: true });

export const toggleTransactional = (customerId: number) =>
  api.post<unknown, IApiResponse>('customer/' + customerId + '/set-transactional/initiate', null, {
    urlEncoded: true,
  });

export const resetCounter = (customerId: number) =>
  api.post<unknown, IApiResponse>('customer/' + customerId + '/reset-counter/initiate', null, {
    urlEncoded: true,
  });

export const kycUpgrade = (body: IKycUpgradeBody) => api.post<unknown, IApiResponse>('customer/kyc-upgrade', body);
