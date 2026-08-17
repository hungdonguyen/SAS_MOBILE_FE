export interface AdminStatMetric {
  id: string;
  title: string;
  value: string | number;
  trend: string;
  iconName: string;
  backgroundColor: string;
  accentColor: string;
}

export type AdminUserRole = 'student' | 'lecturer' | 'admin';

export interface AdminUserItem {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: AdminUserRole;
  department?: string;
  faceRegistered: boolean;
  registeredAt?: string;
  avatarInitials: string;
}

export interface AdminClassItem {
  id: string;
  classCode: string; // e.g. WP301
  subjectName: string; // e.g. Web Programming
  room: string; // e.g. A3-201
  building: string; // e.g. Building A
  lecturerName: string; // e.g. Nguyễn Văn A
  enrolledCount: number;
  totalCapacity: number;
  schedule: string; // e.g. Thứ 3, Thứ 5 (07:30 - 09:30)
  status: 'ongoing' | 'upcoming' | 'completed';
  attendanceRate: number; // percentage
}

export interface AdminRoomItem {
  id: string;
  roomCode: string; // e.g. A3-201
  building: string; // e.g. Building A
  floor: number;
  capacity: number;
  cameraIp: string;
  cameraStatus: 'online' | 'offline' | 'maintenance';
  isActive: boolean;
}

export interface AnomalyAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: string;
  location?: string;
}

export interface AdminSubjectItem {
  id: string;
  code: string;
  name: string;
  credit: number;
  description?: string;
  isActive: boolean;
  sectionsCount?: number;
}

export interface AdminSemesterItem {
  id: string;
  code?: string;
  semesterName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: 'active' | 'upcoming' | 'closed' | 'inactive';
  sectionsCount?: number;
}

export interface AdminNetworkItem {
  id: string;
  networkName: string;
  ipAddress: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

