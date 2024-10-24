export interface IGetMenuBody {
  institutionCode: string;
}

export interface IMenu {
  hasSubMenu: boolean;
  icon: string;
  id: number | string;
  parentID?: number | string | null;
  roleID: number | string;
  routerLink?: string;
  title: string;
}

export interface IMenuData {
  code: number;
  data: IMenu[];
  description: string;
}

export interface IGetRoleFunctionsBody {
  roleId: string;
}

export interface IRoleFunctionsData {
  code: number;
  data: IMenu[];
  description: string;
}

export interface IupdateRoleFunctionBody {
  roleID: string;
  functionIDs: string[];
}
