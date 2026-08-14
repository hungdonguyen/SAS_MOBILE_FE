export interface TodaySessionValidation {
  networkEnabled: boolean;
  gpsEnabled: boolean;
  faceEnabled: boolean;
}

export interface TodaySessionDto {
  sessionId: string;
  subjectName: string;
  subjectCode: string;
  roomName: string;
  startTime: string;
  endTime: string;
  attendanceStatus: 'pending' | 'present' | 'late' | 'absent' | 'excused';
  checkedInAt: string | null;
  validations: TodaySessionValidation;
}

export interface SubmitAttendanceDto {
  sessionId: string;
  checkInMethod?: 'SELF_CHECKIN' | 'FACE_SCAN' | 'QR_CODE' | 'MANUAL';
  note?: string;
  gpsLat?: number;
  gpsLng?: number;
  imageBase64?: string;
}

export interface AttendanceQueuedResponse {
  jobId: string;
  queue: string;
  status: 'queued';
}

export interface JobResultData {
  status: 'present' | 'late';
  confidence?: number;
  message?: string;
  checkedInAt?: string;
  subjectName?: string;
  roomName?: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: 'waiting' | 'active' | 'processing' | 'completed' | 'failed';
  result?: JobResultData;
  error?: string;
}

export interface AttendanceHistoryDto {
  id: string;
  subjectName: string;
  subjectCode: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  roomName: string;
  status: 'present' | 'late' | 'absent' | 'excused';
  checkedInAt: string | null;
}

export interface LoginResponse {
  message: string;
  userId: string;
  role: 'student' | 'lecturer' | 'admin';
  hasRegisteredFace?: boolean;
}

export interface StudentUserSession {
  userId: string;
  username: string;
  role: 'student' | 'lecturer' | 'admin';
  hasRegisteredFace: boolean;
}

/** Response from GET /auth/me */
export interface MeResponse {
  userId: string;
  username: string;
  email: string | null;
  fullName: string | null;
  role: 'student' | 'lecturer' | 'admin';
  isActive: boolean;
  hasRegisteredFace?: boolean;
  avatarUrl?: string | null;
}

/** Response from DELETE /biometrics/:studentId */
export interface DeleteBiometricResponse {
  message: string;
}
