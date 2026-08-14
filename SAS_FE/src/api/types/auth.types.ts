export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  message: string;
  userId: string;
  role: 'admin' | 'lecturer' | 'student';
  hasRegisteredFace?: boolean;
}

export interface CurrentUserResponse {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  role: 'admin' | 'lecturer' | 'student';
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string | null;
  hasRegisteredFace?: boolean;
}
