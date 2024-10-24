import api from 'api/api';
import { IGetDashboardBody, IGetDashboardReturn } from './Dashboard.model';

export const getDashboardData = (body: IGetDashboardBody) =>
  api.post<unknown, IGetDashboardReturn>('user/dashboard', body, { urlEncoded: true });
