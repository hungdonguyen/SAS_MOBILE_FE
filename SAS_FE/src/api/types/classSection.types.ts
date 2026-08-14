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
