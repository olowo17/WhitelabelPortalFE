export interface IConfigsSearch {
  application?: string;
  query?: string;
}

export interface IGetConfigsBody extends IConfigsSearch {
  pageNumber: number;
  pageSize: number;
}

export interface IConfig {
  application: string;
  id: number;
  key: string;
  label: string;
  profile: string;
  value: string | number;
}

export interface IGetConfigsReturn {
  code: number;
  description: string;
  data: IConfig[];
  totalCount: number;
}

export interface ICreateConfig {
  application: string;
  key: string;
  label: string;
  profile: string;
  value: string | number;
}

export interface IUpdateConfig extends ICreateConfig {
  id: number;
}
