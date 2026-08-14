import { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { authStorage } from './storage';

export const requestAuthInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = authStorage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

export const responseSuccessInterceptor = (response: AxiosResponse): AxiosResponse => {
  return response;
};

export const responseErrorInterceptor = (error: AxiosError<any>): Promise<never> => {
  if (error.response) {
    const data = error.response.data;
    // Extract formatted message from backend HttpExceptionFilter
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

    // Attach human-readable message for easy consumption in UI catch blocks
    error.message = extractedMessage;
  } else if (error.request) {
    error.message = 'Unable to connect to the server. Please check your network connection.';
  }

  return Promise.reject(error);
};
