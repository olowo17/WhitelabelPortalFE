export interface IInformation {
  id: number;
  code: string;
  name: string;
  institutionCode: string;
  html: string;
}

export interface IGetInfosData {
  code: number;
  informations: IInformation[];
  description: string;
  totalRecordCount: number;
}

export interface ICreateInfosBody {
  code: string;
  html: string;
}

export interface IUpdateInfosBody {
  id: number;
  name: string;
  code: string;
  html: string;
  institutionCode: string;
}

export interface IUpdateInfosData {
  code: number;
  description: string;
}

export interface IGetInfoTypesData {
  code: number;
  infoTypes: string[];
  description: string;
}
