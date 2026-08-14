import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { apiConfig } from './config';
import { authStorage } from './storage';
import { NavigationService } from '../services/navigationService';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

export const requestAuthInterceptor = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  // Ensure baseURL is always synchronized with latest apiConfig
  config.baseURL = apiConfig.getBaseUrl();

  const token = authStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

export const responseSuccessInterceptor = (response: AxiosResponse): AxiosResponse => {
  return response;
};

export const responseErrorInterceptor = async (error: AxiosError<any>): Promise<never> => {
  const originalRequest = error.config as any;

  // Handle 401 Unauthorized for token refresh
  if (
    error.response?.status === 401 &&
    originalRequest &&
    !originalRequest._retry &&
    !originalRequest.url?.includes('/auth/refresh') &&
    !originalRequest.url?.includes('/auth/login')
  ) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          const newToken = authStorage.getAccessToken();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axios(originalRequest);
        })
        .catch((err) => Promise.reject(err)) as Promise<never>;
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshClient = axios.create({
        baseURL: apiConfig.getBaseUrl(),
        withCredentials: true,
        timeout: 10000,
      });

      const refreshRes = await refreshClient.post('/auth/refresh');

      // Extract new token from cookie or body
      const setCookie = refreshRes.headers['set-cookie'];
      if (setCookie) {
        const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : String(setCookie);
        const match = cookieStr.match(/access_token=([^;]+)/);
        if (match?.[1]) {
          authStorage.setAccessToken(match[1]);
        }
      }

      if (refreshRes.data?.access_token) {
        authStorage.setAccessToken(refreshRes.data.access_token);
      }

      processQueue(null);

      const newToken = authStorage.getAccessToken();
      if (newToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return axios(originalRequest) as Promise<never>;
    } catch (refreshError) {
      processQueue(refreshError as AxiosError);
      authStorage.clear();
      NavigationService.reset('Login');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  // Extract human-readable error message
  if (error.response) {
    const data = error.response.data;
    let extractedMessage = 'An unexpected server error occurred';

    if (data?.error?.message) {
      extractedMessage = Array.isArray(data.error.message)
        ? data.error.message.join(', ')
        : data.error.message;
    } else if (data?.message) {
      extractedMessage = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message;
    }

    error.message = extractedMessage;
  } else if (error.request) {
    error.message = 'Unable to connect to server. Please check backend connection.';
  }

  return Promise.reject(error);
};
