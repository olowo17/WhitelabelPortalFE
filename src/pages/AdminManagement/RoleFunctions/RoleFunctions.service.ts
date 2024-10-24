import api from 'api/api';
import { IApiResponse } from 'models';
import {
  IupdateRoleFunctionBody,
  IGetMenuBody,
  IMenuData,
  IGetRoleFunctionsBody,
  IRoleFunctionsData,
} from './RoleFunctions.model';

export const updateRoleFunction = (body: IupdateRoleFunctionBody) =>
  api.post<unknown, IApiResponse>('system/roles/functions/update', body).then((res) => res);

export const getRoleFunctions = (body: IGetRoleFunctionsBody) =>
  api.post<unknown, IRoleFunctionsData>('system/roles/menus', body, { urlEncoded: true }).then((res) => res);

export const getMenus = (body: IGetMenuBody) =>
  api.post<unknown, IMenuData>('system/roles/menus/all', body, { urlEncoded: true }).then((res) => res);
