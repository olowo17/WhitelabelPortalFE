import { ApolloError, ServerError } from '@apollo/client';
import { AUTH_STORE_KEY } from 'utils/constants';
import routePaths from 'routes/routePaths';
import { store } from 'store/store';
import { toast } from 'store/slices/app/toastSlice';
import { IAuthUser } from 'pages/Authorization/Login/login.model';

export const additionalHeaders = (useJson = false) => {
  const stored = localStorage.getItem(AUTH_STORE_KEY);
  const currentUser: IAuthUser | null = stored ? JSON.parse(stored) : null;
  const sessionID = currentUser?.token || null;
  const reqHeaders: Record<string, string> = {
    'Content-Type': useJson ? 'application/json' : 'application/x-www-form-urlencoded',
    deviceId: localStorage.getItem('deviceID') || '533',
    appVersion: '1.2',
    languageCode: localStorage.getItem('langCode') || '1',
    countryCode: '1',
  };
  if (sessionID) {
    reqHeaders['sessionID'] = sessionID;
  }

  return reqHeaders;
};

export const formParams = (rawData: Record<string, any>): string => {
  const formDataItems: string[] = [];
  buildFormData(formDataItems, rawData);

  function buildFormData(dataItems: string[], data: any, parentKey: string | null = null) {
    if (
      data &&
      typeof data === 'object' &&
      !(data instanceof Date) && // do not loop through dates
      !(data instanceof File) && // do not loop through files
      !(data instanceof Blob) && // do not loop through images and blobs
      !(Array.isArray(data) && !data.length) // do not loop through empty arrays
    ) {
      Object.keys(data).forEach((key) => {
        buildFormData(dataItems, data[key], parentKey ? `${parentKey}[${key}]` : key);
      });
    } else {
      const value = data == null ? '' : (data as string);
      const useKey = parentKey as string;
      dataItems.push(`${useKey}=${value}`);
    }
  }

  return formDataItems.join('&');
};

export const handleApolloError = (error: ApolloError) => {
  const { message, graphQLErrors, networkError } = error;

  console.log(error);

  let rCode = 10;
  let rMessage = message;

  console.log('networkError.message', networkError, { ...networkError });
  const networkErr = networkError as ServerError;
  if (networkErr?.result?.errors?.[0]) {
    const firstNetworkError = networkErr.result.errors[0];
    const { message: msg, extensions: { code } = { code: null } } = firstNetworkError;
    if (msg) rMessage = msg;

    if (code === 'UNAUTHENTICATED' || code === 'FORBIDDEN') {
      rCode = 30;

      doLogoutUser(rMessage);
    }
  } else if (graphQLErrors?.[0]) {
    const graphQLError = graphQLErrors[0];
    const { message: msg } = graphQLError;
    if (msg) rMessage = msg;
  }

  return Promise.reject({ code: rCode, description: rMessage });
};

export const doLogoutUser = (message: string) => {
  store.dispatch(toast({ message, type: 'error' }));
  setTimeout(() => {
    // TODO: simply change auth state and perform router redirect
    localStorage.removeItem(AUTH_STORE_KEY);
    localStorage.removeItem('firstLogin');
    window.location.assign(routePaths.login);
  }, 1000);
};
