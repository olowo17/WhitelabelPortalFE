import api from 'api/api';
import { IApiResponse } from 'models';
import { ISearchCustomerLimit, ISearchCustomerLimitReturn, IUpdateCustomerLimit } from './CustomerLimits.model';

// export const getCustomers = (body: IGetCustomersBody) =>
//   api.post<unknown, IGetCustomersData>('customer/list', body, { urlEncoded: true });

// export const searchCustomer = (body: ISearchCustomerBody) =>
//   api.post<unknown, ISearchCustomerData>('customer/search', body, { urlEncoded: true });

// export const getRegistrationStatuses = () => api.get<unknown, IGetRegStatusData>('customer/registrationStatus');

// export const activateCustomer = (customerId: number) =>
//   api.post<unknown, IApiResponse>('customer/' + customerId + '/enable/initiate', null, { urlEncoded: true });

// export const deactivateCustomer = (customerId: number, reason: string) =>
//   api.post<unknown, IApiResponse>('customer/' + customerId + '/disable', { reason }, { urlEncoded: true });

// export const releaseCustomer = (customerId: number) =>
//   api.post<unknown, IApiResponse>('customer/' + customerId + '/release/initiate', null, { urlEncoded: true });

// export const toggleTransactional = (customerId: number) =>
//   api.post<unknown, IApiResponse>('customer/' + customerId + '/set-transactional/initiate', null, {
//     urlEncoded: true,
//   });

// export const resetCounter = (customerId: number) =>
//   api.post<unknown, IApiResponse>('customer/' + customerId + '/reset-counter/initiate', null, {
//     urlEncoded: true,
//   });

export const searchCustomerLimit = (body: ISearchCustomerLimit) =>
  api.post<unknown, ISearchCustomerLimitReturn>('limit/customer/search', body, { urlEncoded: true });

export const updateCustomerLimit = (body: IUpdateCustomerLimit, customerID: number) =>
  api.put<unknown, IApiResponse>(`limit/customer/${customerID}/edit/initiate`, body);
