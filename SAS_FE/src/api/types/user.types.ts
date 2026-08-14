export interface StudentProfileData {
  registeredAt: string | null;
  hasFaceData: boolean;
}

export interface LecturerProfileData {
  department: string | null;
}

export interface UserResponse {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: 'student' | 'lecturer' | 'admin';
  avatarUrl: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string | null;
  hasFaceRegistered?: boolean;
  temporaryPassword?: string;
}

export interface UserDetailResponse extends UserResponse {
  updatedAt: string | null;
  studentProfile?: StudentProfileData;
  lecturerProfile?: LecturerProfileData;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  fullName: string;
  roleName: 'student' | 'lecturer' | 'admin';
  password?: string;
  department?: string;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  department?: string;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface ResetPasswordRequest {
  newPassword?: string;
}

export interface ResetPasswordResponse {
  message: string;
  userId: string;
  mustChangePassword: true;
  temporaryPassword?: string;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  role?: 'student' | 'lecturer' | 'admin' | '';
  isActive?: boolean;
  q?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
