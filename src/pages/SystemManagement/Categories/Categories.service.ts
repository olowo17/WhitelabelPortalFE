import api from 'api/api';
import { IApiResponse } from 'models';
import { IGetCategories, IGetCategoriesReturn, ICreateCategory, IUpdateCategory } from './Categories.model';

export const getCategories = (body: IGetCategories) =>
  api.post<unknown, IGetCategoriesReturn>('system/categories/search', body, { urlEncoded: true });

export const createCategory = (category: ICreateCategory) =>
  api.post<unknown, IApiResponse>('system/category/create/initiate', category);

export const updateCategory = (category: IUpdateCategory) =>
  api.put<unknown, IApiResponse>('system/category/edit/initiate', category);

// unused
export const activateCategory = (categoryID: number) =>
  api.post<unknown, IApiResponse>(`system/category/${categoryID}/enable/initiate`, null, {
    urlEncoded: true,
  });

//unused
export const deactivateCategory = (categoryID: number) =>
  api.post<unknown, IApiResponse>(`system/category/${categoryID}/disable/initiate`, null, {
    urlEncoded: true,
  });
