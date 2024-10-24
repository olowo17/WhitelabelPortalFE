import api from 'api/api';
import { IApiResponse } from 'models';
import { IGetProducts, IGetProductsReturn, ICreateProduct, IUpdateProduct, IGetBillersReturn } from './Products.model';

export const getAllBillers = () => api.get<unknown, IGetBillersReturn>('system/billers', { urlEncoded: true }); // replace from Billers page

export const getProducts = (body: IGetProducts) =>
  api.post<unknown, IGetProductsReturn>('system/products/search', body, { urlEncoded: true });

export const createProduct = (body: ICreateProduct) =>
  api.post<unknown, IApiResponse>('system/product/create/initiate', body);

export const updateProduct = (body: IUpdateProduct) =>
  api.put<unknown, IApiResponse>('system/product/edit/initiate', body);

export const activateProduct = (productId: number) =>
  api.post<unknown, IApiResponse>(`system/product/${productId}/enable/initiate`, null);

export const deactivateProduct = (productId: number) =>
  api.post<unknown, IApiResponse>(`system/product/${productId}/disable/initiate`, null);
