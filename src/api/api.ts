import axios, { AxiosError } from 'axios';
import { additionalHeaders, doLogoutUser, formParams } from './api-utils';

declare module 'axios' {
  interface AxiosRequestConfig {
    urlEncoded?: boolean;
  }
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE,
});

api.interceptors.request.use(
  function (config) {
    const jsonRequest = !config.urlEncoded;
    let requestBody: any;

    // removes empty or null values from body
    if (config.data) {
      requestBody = {};
      for (const key in config.data) {
        if (!config.data[key] && config.data[key] !== false && key !== 'level') continue;
        requestBody[key] = config.data[key];
      }
    } else {
      requestBody = config.data;
    }

    config.data = jsonRequest ? requestBody : formParams(requestBody);

    config.headers = {
      ...config.headers,
      ...additionalHeaders(jsonRequest),
    };

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  function (response) {
    const responseBody = response.data;
    if (responseBody.code !== 0) {
      if (responseBody.code === 30) {
        doLogoutUser(responseBody.description);
      }
      return Promise.reject(responseBody);
    }

    return responseBody;
  },
  function (error: AxiosError<any, any>) {
    const errorResponse = { code: 10, description: 'Something Happened!' };

    if (error.response) {
      // Request made and server responded
      const resData = error.response.data;
      errorResponse.description = resData.description || resData.message;
    } else if (error.request) {
      // The request was made but no response was received
      errorResponse.description = 'Something went wrong with your request';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorResponse.description = error.message || 'Something Happened!';
    }

    return Promise.reject(errorResponse);
  }
);

// Example
// api
//   .post('user/dashboard', { startDate: '09/01/2021 00:00:00', endDate: '09/01/2021 10:08:07' }, { urlEncoded: false })
//   .then((r) => console.log(r));

export default api;
