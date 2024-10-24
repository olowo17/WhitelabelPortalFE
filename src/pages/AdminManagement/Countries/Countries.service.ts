import { gql } from '@apollo/client';
import api from 'api/api';
import gqlc from 'api/gqlc';
import { IApiResponse, MutateData } from 'models';
import { ICreateCountryBody, IGetCountriesBody, IGetCountriesData, IUpdateCountryBody } from './Countries.model';

export const GET_COUNTRIES_QUERY = gql`
  query Countrys($input: CountriesInput!) {
    countries(input: $input) {
      count
      rows {
        id
        name
        code
        active
      }
    }
  }
`;

export const CREATE_COUNTRY_QUERY = gql`
  mutation CreateCountry($input: CreateCountryInput!) {
    createCountry(input: $input) {
      success
      description
    }
  }
`;

export const UPDATE_COUNTRY_QUERY = gql`
  mutation UpdateCountry($input: UpdateCountryInput!) {
    updateCountry(input: $input) {
      success
      description
    }
  }
`;

export const getCountries = (body: IGetCountriesBody = { pageNumber: 1, pageSize: 10 }) =>
  api.post<unknown, IGetCountriesData>('countries/list', body, { urlEncoded: true }).then((res) => res);

export const createCountry = (body: ICreateCountryBody) =>
  api.post<unknown, IApiResponse>('pending/request/submit/create-country', body).then((res) => res);

export const updateCountry = (body: IUpdateCountryBody) =>
  api.post<unknown, IApiResponse>('pending/request/submit/edit-country', body).then((res) => res);

export const createCountryOld = (body: ICreateCountryBody) =>
  gqlc.mutate<{ createCountry: MutateData }>(CREATE_COUNTRY_QUERY, body).then((res) => res.createCountry);

export const updateCountryOld = (body: IUpdateCountryBody) =>
  gqlc.mutate<{ updateCountry: MutateData }>(UPDATE_COUNTRY_QUERY, body).then((res) => res.updateCountry);
