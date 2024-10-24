import api from 'api/api';
import { IApiResponse } from 'models';
import { IResetPassword, ISearchPassword, ISearchPasswordReturn } from './PasswordReset.model';

export const searchCustomer = (body: ISearchPassword) =>
  api.post<unknown, ISearchPasswordReturn>('customer/search', body, { urlEncoded: true });

export const resetPassword = (body: IResetPassword) =>
  api.post<unknown, IApiResponse>('credentials/customer/password/reset/initiate', body, { urlEncoded: true });
