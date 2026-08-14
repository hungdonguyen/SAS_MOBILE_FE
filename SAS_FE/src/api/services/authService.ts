import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { authStorage } from '../storage';
import { LoginRequest, LoginResponse, CurrentUserResponse } from '../types/auth.types';

export const authService = {
  /**
   * Authenticate user credentials with Backend NestJS
   * POST /auth/login
   */
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        username: payload.username,
        password: payload.password,
      }
    );

    const data = response.data;

    // Extract access_token from Set-Cookie headers if present
    try {
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : String(setCookie);
        const match = cookieStr.match(/access_token=([^;]+)/);
        if (match?.[1]) {
          authStorage.setAccessToken(match[1]);
        }
      }
    } catch (e) {
      console.log('Error parsing auth cookies:', e);
    }

    if ((data as any)?.access_token) {
      authStorage.setAccessToken((data as any).access_token);
    }

    if (data?.userId) {
      authStorage.setUserSession({
        userId: data.userId,
        username: payload.username,
        role: data.role,
        hasRegisteredFace: Boolean(data.hasRegisteredFace),
      });
    }

    return data;
  },

  /**
   * Terminate active user session from backend
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (e) {
      console.log('Logout API error or offline:', e);
    } finally {
      authStorage.clear();
    }
  },

  /**
   * Get current authenticated user profile
   * GET /auth/me
   */
  getMe: async (): Promise<CurrentUserResponse> => {
    const response = await apiClient.get<CurrentUserResponse>(API_ENDPOINTS.AUTH.ME);
    const data = response.data;
    if (data?.userId) {
      authStorage.setUserSession({
        userId: data.userId,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        avatarUrl: data.avatarUrl,
        hasRegisteredFace: Boolean(data.hasRegisteredFace),
      });
    }
    return data;
  },
};

export default authService;
