import api from 'api/api';
import { IGetAppRatingsBody, IGetAppRatingsReturn } from './AppRatings.model';

export const getAppRatings = (body: IGetAppRatingsBody) =>
  api.post<unknown, IGetAppRatingsReturn>('feedback/feedBackInfo', body);
