import { PaginatedResponse } from './common.types';

export interface SubjectSummary {
  subjectId: string;
  code: string;
  name: string;
  credit: number;
}

export interface SemesterSummary {
  semesterId: string;
  semesterName: string;
  code: string | null;
  isActive: boolean;
}

export interface LecturerSummary {
  userId: string;
  fullName: string;
  email: string;
}

export interface SectionScheduleSummary {
  scheduleId: string;
  roomId: string;
  roomCode: string;
  building?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

export interface ClassSectionResponse {
  sectionId: string;
  subject: SubjectSummary;
  semester: SemesterSummary;
  lecturer: LecturerSummary;
  createdAt: string | null;
  updatedAt: string | null;
  sectionSchedules?: SectionScheduleSummary[];
  _count?: {
    enrollments: number;
  };
}

export interface ClassSectionDetailResponse extends ClassSectionResponse {
  schedules: SectionScheduleSummary[];
  enrollmentCount: number;
}

export interface ClassSectionQuery {
  page?: number;
  limit?: number;
  q?: string;
  semesterId?: string;
  subjectId?: string;
  lecturerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClassSessionAttendanceSummary {
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  pendingCount: number;
  attendanceRate: number;
}

export interface ClassSessionDto {
  sessionId: string;
  scheduleId: string;
  sessionDate: string;
  dayOfWeek?: string;
  timeRange?: string;
  sessionStatus: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  startedAt: string | null;
  endedAt: string | null;
  networkValidationEnabled?: boolean;
  gpsValidationEnabled?: boolean;
  faceValidationEnabled?: boolean;
  attendanceSummary: ClassSessionAttendanceSummary;
}

export type PaginatedClassSessionResponseDto = PaginatedResponse<ClassSessionDto>;

export interface EnrolledStudentDto {
  studentId: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  attendanceRate: number;
  hasRegisteredFace: boolean;
  enrolledAt: string;
}

export type PaginatedEnrolledStudentResponseDto = PaginatedResponse<EnrolledStudentDto>;
