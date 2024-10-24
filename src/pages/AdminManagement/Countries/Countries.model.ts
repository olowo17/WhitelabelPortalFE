export interface ICountry {
  id: number | string;
  name: string;
  code: string;
  active: boolean;
}

export interface IGetCountriesBody {
  pageNumber: number;
  pageSize?: number;
  name?: string;
  active?: boolean;
}

export interface IGetCountriesData {
  code: number;
  countries: ICountry[];
  description: string | null;
  totalRecordCount: number;
}

export interface IUpdateCountryBody {
  name: string;
  code: string;
  id: number | string;
}

export interface ICreateCountryBody {
  name: string;
  code: string;
}
