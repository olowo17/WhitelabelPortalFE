export interface IUpdateBranchBody {
  name: string;
  code: string;
  institutionCode?: string;
  id: number | string;
}

export interface ICreateBranchBody {
  name: string;
  code: string;
  institutionCode?: string;
}

interface IInstitution {
  code: string;
  country_id: string;
  id: number | string;
  name: string;
  isISW: boolean;
  country: ICountry;
}

interface ICountry {
  id: number | string;
  name: string;
}

export interface IBranch {
  activeStatus: boolean;
  code: string;
  id: number | string;
  institutionCode: string;
  institutionId: string;
  name: string;
}

export interface IGetBranchesReturn {
  data: IBranch[];
  description: string;
  totalCount: number;
}

export interface IGetBranchesBody {
  pageNumber: number;
  pageSize?: number;
  institutionCode?: string;
}

// export interface IGetBranchesData {
//   rows: IBranch[];
//   count: number;
// }

export interface IActivateBranch {
  code: string | number;
}

export interface IDeactivateBranch {
  code: string | number;
}
