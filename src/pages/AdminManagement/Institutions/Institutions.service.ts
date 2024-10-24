import { gql } from '@apollo/client';
import api from 'api/api';
import gqlc from 'api/gqlc';
import { IApiResponse, MutateData } from 'models';
import {
  ICreateInstitutionBody,
  IGetInstitutionsBody,
  IGetInstitutionsData,
  IUpdateInstitutionBody,
} from './Institutions.model';

export const GET_INSTITUTIONS_QUERY = gql`
  query Institutions($input: InstitutionsInput!) {
    institutions(input: $input) {
      count
      rows {
        id
        name
        code
        accentColor
        logo
        isISW
        country_id
        bankCode
        currentAppVersion
        forceUpdate
        country {
          id
          name
          code
        }
      }
    }
  }
`;

export const CREATE_INSTITUTION_QUERY = gql`
  mutation CreateInstitution($input: CreateInstitutionInput!) {
    createInstitution(input: $input) {
      success
      description
    }
  }
`;

export const UPDATE_INSTITUTION_QUERY = gql`
  mutation UpdateInstitution($input: UpdateInstitutionInput!) {
    updateInstitution(input: $input) {
      success
      description
    }
  }
`;

// export const getInstitutions = (body: IGetInstitutionsBody = { pageNumber: 1 }) =>
//   gqlc.query<{ institutions: IGetInstitutionsData }>(GET_INSTITUTIONS_QUERY, body).then((d) => d.institutions);

export const getInstitutions = (body: IGetInstitutionsBody) => {
  const actualBody = { pageSize: 200, ...body };
  return api
    .post<unknown, IGetInstitutionsData>('institution/list', actualBody, { urlEncoded: true })
    .then((res) => res);
};

export const createInstitution = (body: ICreateInstitutionBody) =>
  api.post<unknown, IApiResponse>('pending/request/submit/create-institution', body).then((res) => res);

export const updateInstitution = (body: IUpdateInstitutionBody) =>
  api.post<unknown, IApiResponse>('pending/request/submit/edit-institution', body).then((res) => res);

export const createInstitutionOld = (body: ICreateInstitutionBody) =>
  gqlc.mutate<{ createInstitution: MutateData }>(CREATE_INSTITUTION_QUERY, body).then((res) => res.createInstitution);

export const updateInstitutionOld = (body: IUpdateInstitutionBody) =>
  gqlc.mutate<{ updateInstitution: MutateData }>(UPDATE_INSTITUTION_QUERY, body).then((res) => res.updateInstitution);
