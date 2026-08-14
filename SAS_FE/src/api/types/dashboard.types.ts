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
  assignedClasses: number;
  totalStudents: number;
  averageAttendanceRate: number;
  todaySessionsCount: number;
}

/**
 * Lecturer Today Session DTO
 * Item of GET /dashboard/lecturer/today-sessions
 */
export interface LecturerTodaySessionDto {
  sessionId: string;
  scheduleId: string;
  sectionId: string;
  subjectCode: string;
  subjectName: string;
  room: string;
  building: string;
  startTime: string;
  endTime: string;
  sessionDate: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  checkedInCount: number;
  totalEnrolled: number;
  attendanceRate: number;
}
