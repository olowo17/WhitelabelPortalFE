export interface IAppRating {
  feedbackDate: number;
  deviceId: string;
  userName: null;
  transactionRef: string;
  comment: string;
  rating: number;
  amount: null;
  institutionCode: string;
}

export interface IGetAppRatingsReturn {
  code: 0;
  description: null;
  totalRecordCount: 67;
  feedBackInfos: IAppRating[];
}

export interface IAppRatingsValues {
  startDate?: string;
  endDate?: string;
  username?: string;
  institutionCode?: string;
}

export interface IGetAppRatingsBody extends IAppRatingsValues {
  pageNumber: number;
  pageSize: number;
}
