import api from 'api/api';
import { IApiResponse } from 'models';
import { ICreateRoleBody, IGetRolesBody, IGetRolesData, IUpdateRoleBody } from './Roles.model';

export const getRoles = (body: IGetRolesBody = { pageNumber: 1, pageSize: 10 }) =>
  api.post<unknown, IGetRolesData>('system/roles/list', body, { urlEncoded: true }).then((res) => res);
export const createRole = (body: ICreateRoleBody) =>
  api.post<unknown, IApiResponse>('system/roles/create', body).then((res) => res);
export const updateRole = (body: IUpdateRoleBody) =>
  api.put<unknown, IApiResponse>('system/roles/update', body).then((res) => res);
