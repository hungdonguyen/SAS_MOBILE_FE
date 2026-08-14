export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused' | 'pending';

export interface SessionAttendanceRecordDto {
  attendanceId: string;
  studentId: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  status: AttendanceStatus;
  checkInMethod: string | null;
  checkedInAt: string | null;
  note: string | null;
  confidence: number | null;
  ipAddress: string | null;
  deviceInfo: string | null;
  recognitionResult: string | null;
  isOverridden: boolean;
  originalStatus: AttendanceStatus | null;
}

export interface SessionAttendanceSummaryDto {
  enrolledCount: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  pendingCount: number;
  attendanceRate: number;
}

export interface SessionInfoSummaryDto {
  sessionId: string;
  scheduleId: string;
  sessionDate: string;
  status: string;
  subjectCode: string;
  subjectName: string;
  room: string;
  building: string;
  startTime: string;
  endTime: string;
  timeFormatted: string;
  networkValidationEnabled: boolean;
  gpsValidationEnabled: boolean;
  faceValidationEnabled: boolean;
}

export interface SessionAttendanceDetailResponseDto {
  session: SessionInfoSummaryDto;
  summary: SessionAttendanceSummaryDto;
  data: SessionAttendanceRecordDto[];
  meta: {
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
