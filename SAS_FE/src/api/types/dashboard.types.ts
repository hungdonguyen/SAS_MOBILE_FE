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
