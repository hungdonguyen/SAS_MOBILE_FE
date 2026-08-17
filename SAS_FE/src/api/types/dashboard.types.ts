import { AdminClassItem, AdminStatMetric, AnomalyAlert } from '../../types/adminTypes';

export interface DashboardMetricsData {
  totalClasses: number;
  totalStudents: number;
  avgAttendanceRate: number;
  activeSessionsCount: number;
}

export interface AdminDashboardData {
  stats: AdminStatMetric[];
  alerts: AnomalyAlert[];
  activeClasses: AdminClassItem[];
}

/**
 * Lecturer Dashboard KPI Statistics DTO
 * Response of GET /dashboard/lecturer/stats
 */
export interface LecturerStatsResponseDto {
  assignedClassesCount: number;
  totalStudentsCount: number;
  averageAttendanceRate: number;
  todaySessionsCount: number;
  // Optional aliases for backward compatibility
  assignedClasses?: number;
  totalStudents?: number;
}

/**
 * Lecturer Today Session DTO
 * Item of GET /dashboard/lecturer/today-sessions
 */
export interface LecturerTodaySessionDto {
  sessionId: string;
  sectionId: string;
  courseCode: string;
  courseName: string;
  roomCode: string;
  building: string;
  timeRange: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  presentCount: number;
  totalEnrolled: number;
  attendanceRatio?: string;
  progressPercentage?: number;
  validations?: {
    networkEnabled: boolean;
    gpsEnabled: boolean;
    faceEnabled: boolean;
  };
  // Optional aliases
  subjectCode?: string;
  subjectName?: string;
  room?: string;
  checkedInCount?: number;
}
