import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { authStorage } from '../storage';
import {
  LoginRequest,
  LoginResponse,
  CurrentUserResponse,
} from '../types/auth.types';
import { ApiMessageResponse } from '../types/common.types';

export const authService = {
  /**
   * Login user with username and password.
   */
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      payload
    );

    // Save session in auth storage
    if (response.data?.userId && response.data?.role) {
      authStorage.setUserSession(response.data.userId, response.data.role);
    }

    return response.data;
  },

  /**
   * Fetch currently authenticated user profile.
   */
  async getMe(): Promise<CurrentUserResponse> {
    const response = await apiClient.get<CurrentUserResponse>(
      API_ENDPOINTS.AUTH.ME
    );
    return response.data;
  },

  /**
   * Log out currently authenticated session.
   */
  async logout(): Promise<ApiMessageResponse> {
    try {
      const response = await apiClient.post<ApiMessageResponse>(
        API_ENDPOINTS.AUTH.LOGOUT
      );
      authStorage.clear();
      return response.data;
    } catch (error) {
      authStorage.clear();
      throw error;
    }
  },

  /**
   * Refresh JWT token.
   */
  async refreshToken(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
  },
};

export default authService;
