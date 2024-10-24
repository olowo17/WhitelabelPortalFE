export interface IRole {
  dateCreated: string;
  dateModified: string;
  description: string;
  name: string;
  roleID: number;
  institutionCode?: string;
}

export interface IGetRolesBody {
  pageNumber: number;
  pageSize?: number;
  institutionCode?: string;
}

export interface IGetRolesData {
  code: number;
  description: string;
  data: IRole[];
}

export interface ICreateRoleSearch {
  description: string;
  name: string;
  country_id: string;
  institutionCode: string;
}

export interface ICreateRoleBody {
  description: string;
  name: string;
  institutionCode: string;
}

export interface IUpdateRoleBody {
  description: string;
  name: string;
  roleId: number;
}
