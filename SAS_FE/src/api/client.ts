import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from './config';
import {
  requestAuthInterceptor,
  responseSuccessInterceptor,
  responseErrorInterceptor,
} from './interceptors';

/**
 * Global configured Axios Client for Smart Attendance System.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach interceptors
apiClient.interceptors.request.use(requestAuthInterceptor, (error) => Promise.reject(error));
apiClient.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor);

export default apiClient;
