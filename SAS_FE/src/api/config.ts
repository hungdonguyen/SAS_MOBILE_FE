import { apiConfig } from '../services/apiConfig';

export { apiConfig };

export const API_TIMEOUT_MS = 15000;

export const getBaseUrl = (): string => apiConfig.getBaseUrl();
