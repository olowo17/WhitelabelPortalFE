import { gql } from '@apollo/client';
import gqlc from 'api/gqlc';
import { IGetProfileBody, IGetProfileReturn } from './Profile.model';

export const GET_USER_QUERY = gql`
  query User($input: UserInput!) {
    user(input: $input) {
      emailAddress
      firstName
      lastName
      mobileNumber
      username
      role {
        name
      }
      branch {
        name
      }
      institution {
        name
      }
    }
  }
`;

// TODO: move to the REST api or replace to data from authUser
export const getProfile = (body: IGetProfileBody = { id: 26 }) =>
  gqlc.query<{ user: IGetProfileReturn }>(GET_USER_QUERY, body).then((d) => d.user);
