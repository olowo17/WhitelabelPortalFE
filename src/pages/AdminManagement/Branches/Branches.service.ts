import api from 'api/api';
import { IApiResponse } from 'models';
import {
  IGetBranchesBody,
  IGetBranchesReturn,
  IActivateBranch,
  IDeactivateBranch,
  ICreateBranchBody,
  IUpdateBranchBody,
} from './Branches.model';

export const getBranches = (body: IGetBranchesBody) =>
  api.post<unknown, IGetBranchesReturn>('system/branches/search', body, { urlEncoded: true });

export const createBranch = (body: ICreateBranchBody) =>
  api.post<unknown, IApiResponse>('pending/request/submit/create-branch', body);

export const updateBranch = (body: IUpdateBranchBody) =>
  api.post<unknown, IApiResponse>('pending/request/submit/edit-branch', body);

export const activateBranch = (body: IActivateBranch) =>
  api.post<unknown, IApiResponse>('pending/request/submit/enable-branch', body);

export const deactivateBranch = (body: IDeactivateBranch) =>
  api.post<unknown, IApiResponse>('pending/request/submit/disable-branch', body);
