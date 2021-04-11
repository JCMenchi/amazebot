import axios from 'axios';

import LOGGER from './uilogger';

/*==============================================================*/
/**            Setup AXIOS instance                             */
/*==============================================================*/
const axiosInstance = axios.create({
    timeout: 30000,
    headers: { 'content-type': 'application/json' }
});

export default axiosInstance;

// Add a request interceptor
axiosInstance.interceptors.request.use(function (config) {
    LOGGER.debug(`Send (${config.method}) request to ${config.url}`);
    return config;
}, function (error) {
    LOGGER.debug(`Error(${error.request.status}) in axios request to (${error.config.method})${error.config.url}: ${error.request.data}`);
    return Promise.reject(error);
});

// Add a response interceptor
axiosInstance.interceptors.response.use(function (response) {
    LOGGER.debug(`Get response of (${response.config.method}) request to ${response.config.url}:`, response.data);
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    LOGGER.debug(`Error(${error.response.status}) in axios response to (${error.config.method})${error.config.url}: ${error.response.data}`);
    return Promise.reject(error);
});

/*
 
 Error Object 
 { isAxiosError: bool
   request: {
       status: HTTP code
       statusText: http message
       response: error message
       responseText: error message
   }
   config: {
     url?: string;
     method?: Method;
     baseURL?: string;
   }
   response: {
       status: HTTP code
       statusText: http message
       data: error message
   }
  
*/