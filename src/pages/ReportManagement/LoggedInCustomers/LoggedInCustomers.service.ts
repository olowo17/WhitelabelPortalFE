import api from 'api/api';
import { IGetLoggedCustomersBody, IGetLoggedCustomersReturn } from './LoggedInCustomers.model';

export const getLoggedCustomers = (body: IGetLoggedCustomersBody) =>
  api.post<unknown, IGetLoggedCustomersReturn>('customer/daily-report', body, { urlEncoded: true });
