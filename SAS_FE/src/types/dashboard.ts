export type SessionStatusType = 'ongoing' | 'upcoming' | 'completed' | 'cancelled';

export interface LecturerProfile {
  id: string;
  fullName: string;
  username: string;
  role: string;
  department: string;
  avatarUrl?: string;
}

export interface StatMetric {
  id: string;
  title: string;
  value: string | number;
  trend: string;
  iconName: string;
  iconType?: 'ionicons' | 'feather' | 'material';
  backgroundColor: string;
  accentColor: string;
}

export interface ScheduleItem {
  id: string;
  classId: string; // e.g. WP301, SE201, DB301
  subjectName: string;
  room: string;
  building: string;
  startTime: string; // e.g. "07:30"
  endTime: string; // e.g. "09:30"
  timeFormatted: string; // e.g. "07:30 - 09:30"
  checkedInCount: number;
  totalCapacity: number;
  status: SessionStatusType;
}

export interface DashboardData {
  lecturer: LecturerProfile;
  currentDate: string;
  stats: StatMetric[];
  schedules: ScheduleItem[];
}
