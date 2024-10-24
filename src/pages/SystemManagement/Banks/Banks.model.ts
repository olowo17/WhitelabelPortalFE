export interface IBank {
  bankID: number;
  code: string;
  name: string;
  gatewayCode: string;
  status: boolean;
  filtered: boolean;
  processor: string;
}

export interface IGetBanksBody {
  pageNumber: number;
  pageSize?: number;
  bankName?: string;
}

export interface IGetBanksData {
  code: number;
  description: string;
  banks: IBank[];
  totalRecordCount: number;
}

export interface IUpdateBank {
  name: string;
  code: string;
  bankID: number;
}

export interface ICreateBank {
  name: string;
  code: string;
}
