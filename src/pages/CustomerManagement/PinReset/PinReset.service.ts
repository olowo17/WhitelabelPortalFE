import api from 'api/api';
import { IApiResponse } from 'models';
import { IResetPin, ISearchPin, ISearchPinReturn } from './PinReset.model';

export const searchCustomer = (body: ISearchPin) =>
  api.post<unknown, ISearchPinReturn>('customer/search', body, { urlEncoded: true });

export const resetPin = (body: IResetPin) =>
  api.post<unknown, IApiResponse>('credentials/pin/reset/initiate', body, { urlEncoded: true });
