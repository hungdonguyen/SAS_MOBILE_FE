export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused' | 'pending';

export interface StudentAttendanceRecordDto {
  enrollmentId: string;
  studentId: string;
  mssv: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  faceRegistered: boolean;
  attendanceId: string | null;
  status: AttendanceStatus;
  checkInMethod: 'SELF_CHECKIN' | 'MANUAL' | string | null;
  checkedInAt: string | null;
  note: string | null;
  confidence: number | null;
  deviceInfo: string | null;
  ipAddress: string | null;
  isOverridden: boolean;
  updatedBy?: string | null;
  updatedAt?: string | null;
  // Aliases for compatibility
  username?: string;
  fullName?: string;
}

export type SessionAttendanceRecordDto = StudentAttendanceRecordDto;

export interface AttendanceSummaryDto {
  totalStudents: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  pendingCount: number;
  attendanceRate?: number;
  // Aliases
  enrolledCount?: number;
}

export type SessionAttendanceSummaryDto = AttendanceSummaryDto;

export interface SessionInfoDto {
  sessionId: string;
  sectionId: string;
  subjectName: string;
  subjectCode: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionStatus: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | string;
  validations: {
    networkValidationEnabled: boolean;
    gpsValidationEnabled: boolean;
    faceValidationEnabled: boolean;
  };
}

export type SessionInfoSummaryDto = SessionInfoDto;

export interface SessionAttendanceDetailResponseDto {
  session: SessionInfoDto;
  summary: AttendanceSummaryDto;
  students: StudentAttendanceRecordDto[];
  data?: StudentAttendanceRecordDto[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BatchAttendanceOverrideRecord {
  studentId: string;
  status: 'present' | 'late' | 'absent' | 'excused';
  reason: string;
}

export interface BatchAttendanceOverrideDto {
  records: BatchAttendanceOverrideRecord[];
}

export interface SingleAttendanceOverrideDto {
  status: 'present' | 'late' | 'absent' | 'excused';
  reason: string;
}

export interface SessionControlsResponseDto {
  sessionId: string;
  networkValidationEnabled: boolean;
  gpsValidationEnabled: boolean;
  faceValidationEnabled: boolean;
}
