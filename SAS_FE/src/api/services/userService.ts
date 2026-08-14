import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { PaginatedResponse, ApiMessageResponse } from '../types/common.types';
import {
  UserResponse,
  UserDetailResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UserQuery,
} from '../types/user.types';

export const userService = {
  /**
   * List users with pagination, filters, and search query.
   */
  async listUsers(query?: UserQuery): Promise<PaginatedResponse<UserResponse>> {
    const params: Record<string, any> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.role) params.role = query.role;
    if (query?.isActive !== undefined) params.isActive = query.isActive;
    if (query?.q?.trim()) params.q = query.q.trim();
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;

    const response = await apiClient.get<PaginatedResponse<UserResponse>>(
      API_ENDPOINTS.USERS.BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Get user detail by UUID.
   */
  async getUserById(id: string): Promise<UserDetailResponse> {
    const response = await apiClient.get<UserDetailResponse>(
      API_ENDPOINTS.USERS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Create a new user account.
   */
  async createUser(payload: CreateUserRequest): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>(
      API_ENDPOINTS.USERS.BASE,
      payload
    );
    return response.data;
  },

  /**
   * Update user details.
   */
  async updateUser(id: string, payload: UpdateUserRequest): Promise<UserResponse> {
    const response = await apiClient.patch<UserResponse>(
      API_ENDPOINTS.USERS.BY_ID(id),
      payload
    );
    return response.data;
  },

  /**
   * Activate or deactivate a user account.
   */
  async updateUserStatus(id: string, payload: UpdateUserStatusRequest): Promise<ApiMessageResponse & { userId: string; isActive: boolean }> {
    const response = await apiClient.patch<ApiMessageResponse & { userId: string; isActive: boolean }>(
      API_ENDPOINTS.USERS.STATUS(id),
      payload
    );
    return response.data;
  },

  /**
   * Reset user's password.
   */
  async resetPassword(id: string, payload?: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ResetPasswordResponse>(
      API_ENDPOINTS.USERS.RESET_PASSWORD(id),
      payload || {}
    );
    return response.data;
  },

  /**
   * Hard delete a user account.
   */
  async deleteUser(id: string): Promise<ApiMessageResponse & { deletedUserId: string }> {
    const response = await apiClient.delete<ApiMessageResponse & { deletedUserId: string }>(
      API_ENDPOINTS.USERS.BY_ID(id)
    );
    return response.data;
  },
};

export default userService;
