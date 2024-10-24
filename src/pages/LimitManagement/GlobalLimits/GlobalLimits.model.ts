export interface IGlobalLimit {
  institutionCode: string;
  level: number | string;
  levelText: number;
  transactionLimit: number | null;
  transactionLimitMax: number;
  dailyLimitMax: number;
  dailyLimit: number;
}

export interface ISearchGlobalLimit {
  institutionCode: string;
}

export interface ISearchGlobalLimitBody extends ISearchGlobalLimit {
  pageNumber: number;
  pageSize: number;
}

export interface ISearchGlobalLimitReturn {
  code: number;
  description: string;
  globalLimits: IGlobalLimit[];
  useKyc: boolean;
  totalRecordCount: number;
}

export interface IUpdateGlobalLimit {
  institutionCode?: string;
  dailyLimit: number | string;
  transactionLimit: number | string;
  level: number | string;
}
