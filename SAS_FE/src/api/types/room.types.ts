export interface RoomResponse {
  roomId: string;
  room: string;
  building: string;
  floor: number;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateRoomRequest {
  room: string;
  building: string;
  floor: number;
  latitude: number;
  longitude: number;
  radius: number;
  isActive?: boolean;
}

export interface UpdateRoomRequest {
  room?: string;
  building?: string;
  floor?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  isActive?: boolean;
}

export interface RoomQuery {
  page?: number;
  limit?: number;
  search?: string;
  q?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
