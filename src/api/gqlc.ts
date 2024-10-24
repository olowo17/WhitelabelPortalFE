import { ApolloClient, InMemoryCache, ApolloQueryResult, FetchResult } from '@apollo/client';
import { QueryOptions } from '@apollo/client/core/watchQueryOptions';
import { AnyRec } from 'models';
import { additionalHeaders, handleApolloError } from './api-utils';

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_BASE,
  cache: new InMemoryCache(),
});

class GqlClient {
  public query<RT = AnyRec, BT = AnyRec>(query: QueryOptions['query'], body?: BT): Promise<RT> {
    return client
      .query({
        query,
        ...(body && { variables: { input: body } }),
        fetchPolicy: 'network-only',
        context: {
          headers: {
            ...additionalHeaders(true),
          },
        },
      })
      .then((response: ApolloQueryResult<RT>) => response.data)
      .catch(handleApolloError);
  }

  public mutate<RT = AnyRec, BT = AnyRec>(query: QueryOptions['query'], body: BT): Promise<RT> {
    return client
      .mutate({
        mutation: query,
        variables: { input: body },
        context: {
          headers: {
            ...additionalHeaders(true),
          },
        },
      })
      .then((response: FetchResult<RT>) => response.data || ({} as RT))
      .catch(handleApolloError)
      .then((d) => {
        return d;
      });
  }
}

const gqlc = new GqlClient();

// === AUTHORIZATION ===

const clientAuth = new ApolloClient({
  uri: process.env.REACT_APP_API_BASE,
  cache: new InMemoryCache(),
});

class GqlClientAuth {
  public query<RT = AnyRec, BT = AnyRec>(query: QueryOptions['query'], body?: BT): Promise<RT> {
    return clientAuth
      .query({
        query,
        ...(body && { variables: { input: body } }),
        fetchPolicy: 'network-only',
        context: {
          headers: {
            ...additionalHeaders(true),
          },
        },
      })
      .then((response: ApolloQueryResult<RT>) => response.data)
      .catch(handleApolloError);
  }

  public mutate<RT = AnyRec, BT = AnyRec>(query: QueryOptions['query'], body: BT): Promise<RT> {
    return clientAuth
      .mutate({
        mutation: query,
        variables: { input: body },
        context: {
          headers: {
            ...additionalHeaders(true),
          },
        },
      })
      .then((response: FetchResult<RT>) => response.data || ({} as RT))
      .catch(handleApolloError)
      .then((d) => {
        return d;
      });
  }
}

export const gqlcAuth = new GqlClientAuth();

// Example
// const GET_USERS_QUERY = gql`
//   query Users($input: UsersInput!) {
//     users(input: $input) {
//       count
//       rows {
//         id
//         emailAddress
//         firstName
//         lastName
//         mobileNumber
//         username
//         status
//       }
//     }
//   }
// `;

// gqlc.query(GET_USERS_QUERY, { pageNumber: 1 }).then((r) => console.log('gql', r));

export default gqlc;
