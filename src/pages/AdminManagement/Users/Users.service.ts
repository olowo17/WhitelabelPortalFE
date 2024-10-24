import { gql } from '@apollo/client';
import api from 'api/api';
import gqlc from 'api/gqlc';
import { IApiResponse, MutateData } from 'models';
import { ICreateUserBody, IGetUsersBody, IGetUsersData, IUpdateUserBody } from './Users.model';

export const getUsers = (body: IGetUsersBody = { pageNumber: 1, pageSize: 10 }) =>
  api.post<unknown, IGetUsersData>('user/search', body, { urlEncoded: true }).then((res) => res);
export const createUser = (body: ICreateUserBody) =>
  api.post<unknown, IApiResponse>('pending/request/submit/create-portal-user', body).then((res) => res);
export const activateUser = (body: { userName: string }) =>
  api.post<unknown, IApiResponse>('pending/request/submit/enable-portal-user', body).then((res) => res);
export const deactivateUser = (body: { userName: string }) =>
  api.post<unknown, IApiResponse>('pending/request/submit/disable-portal-user', body).then((res) => res);
export const updateUser = (body: IUpdateUserBody) =>
  api.post<unknown, IApiResponse>('pending/request/submit/edit-portal-user', body).then((res) => res);

export const GET_USERS_QUERY = gql`
  query Users($input: UsersInput!) {
    users(input: $input) {
      count
      rows {
        id
        emailAddress
        firstName
        lastName
        mobileNumber
        username
        status
        role_id
        role {
          id
          name
          description
        }
        branch_id
        branch {
          id
          name
          code
        }
        institution_id
        institution {
          id
          name
          code
          isISW
          country_id
          country {
            id
            name
          }
        }
      }
    }
  }
`;

export const fetchUsers = (body: IGetUsersBody = { pageNumber: 1 }) =>
  gqlc.query<{ users: IGetUsersData }>(GET_USERS_QUERY, body).then((r) => r.users);

const CREATE_USER_QUERY = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      success
      description
    }
  }
`;

export const createUserOld = (body: ICreateUserBody) =>
  gqlc.mutate<{ createUser: MutateData }>(CREATE_USER_QUERY, body).then((res) => res.createUser);

const UPDATE_USER_QUERY = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      success
      description
    }
  }
`;

export const updateUserOld = (body: ICreateUserBody) =>
  gqlc.mutate<{ updateUser: MutateData }>(UPDATE_USER_QUERY, body).then((res) => res.updateUser);

const ACTIVATE_USER_QUERY = gql`
  mutation ActivateUser($input: ActivateUserInput!) {
    activateUser(input: $input) {
      success
      description
    }
  }
`;

export const activateUserOld = (body: { id: string | number }) => {
  return gqlc.mutate<{ activateUser: MutateData }>(ACTIVATE_USER_QUERY, body).then((res) => res.activateUser);
};

const DEACTIVATE_USER_QUERY = gql`
  mutation DeactivateUser($input: DeactivateUserInput!) {
    deactivateUser(input: $input) {
      success
      description
    }
  }
`;

export const deactivateUserOld = (body: { id: string | number }) => {
  return gqlc.mutate<{ deactivateUser: MutateData }>(DEACTIVATE_USER_QUERY, body).then((res) => res.deactivateUser);
};
