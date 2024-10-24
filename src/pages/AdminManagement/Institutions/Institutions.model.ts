import { ICountry } from 'pages/AdminManagement/Countries/Countries.model';

export interface IInstitution {
  __typename: string;
  id: number | string;
  name: string;
  code: string;
  accentColor: string;
  logo: string;
  isISW: boolean;
  country: ICountry;
  country_id: number | string;
  bankCode: string;
  currentAppVersion: string;
  forceUpdate: boolean;
  usekyc: boolean;
}

export interface IGetInstitutionsBody {
  pageNumber: number;
  pageSize?: number;
  country_id?: string;
}

export interface IGetInstitutionsData {
  institutions: IInstitution[];
  totalRecordCount: number;
}

export interface ICreateInstitutionBody {
  name: string;
  code: string;
  accentColor: string;
  logo: string;
  configFile: string;
  bankCode: string;
  currentAppVersion: string;
  forceUpdate: boolean;
  country_id: number | string;
  countryId: number | string;
  usekyc?: boolean;
}

export interface IUpdateInstitutionBody extends ICreateInstitutionBody {
  id: number | string;
}

export interface IMappedOption {
  label: string;
  id: number | string;
  code: string;
}
