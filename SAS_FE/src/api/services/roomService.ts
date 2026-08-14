import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { PaginatedResponse, ApiMessageResponse } from '../types/common.types';
import {
  RoomResponse,
  CreateRoomRequest,
  UpdateRoomRequest,
  RoomQuery,
} from '../types/room.types';

export const roomService = {
  /**
   * List rooms with pagination and search query.
   */
  async listRooms(query?: RoomQuery): Promise<PaginatedResponse<RoomResponse>> {
    const params: Record<string, any> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.isActive !== undefined) params.isActive = query.isActive;
    if (query?.q?.trim()) params.q = query.q.trim();
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;

    const response = await apiClient.get<PaginatedResponse<RoomResponse>>(
      API_ENDPOINTS.ROOMS.BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Get room detail by ID.
   */
  async getRoomById(id: string): Promise<RoomResponse> {
    const response = await apiClient.get<RoomResponse>(
      API_ENDPOINTS.ROOMS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Create a new campus room with geofencing.
   */
  async createRoom(payload: CreateRoomRequest): Promise<RoomResponse> {
    const response = await apiClient.post<RoomResponse>(
      API_ENDPOINTS.ROOMS.BASE,
      payload
    );
    return response.data;
  },

  /**
   * Update room details or GPS coordinates.
   */
  async updateRoom(id: string, payload: UpdateRoomRequest): Promise<RoomResponse> {
    const response = await apiClient.patch<RoomResponse>(
      API_ENDPOINTS.ROOMS.BY_ID(id),
      payload
    );
    return response.data;
  },

  /**
   * Delete room.
   */
  async deleteRoom(id: string): Promise<ApiMessageResponse & { deletedRoomId: string }> {
    const response = await apiClient.delete<ApiMessageResponse & { deletedRoomId: string }>(
      API_ENDPOINTS.ROOMS.BY_ID(id)
    );
    return response.data;
  },
};

export default roomService;
