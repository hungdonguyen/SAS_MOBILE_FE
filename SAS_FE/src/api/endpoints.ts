/**
 * Centralized backend API endpoint paths for Smart Attendance System.
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    GOOGLE: '/auth/google',
  },

  // Dashboard KPIs
  DASHBOARD: {
    LECTURER_STATS: '/dashboard/lecturer/stats',
    LECTURER_TODAY_SESSIONS: '/dashboard/lecturer/today-sessions',
    ADMIN_STATS: '/dashboard/admin/stats',
    ADMIN_ACTIVE_CLASSES: '/dashboard/admin/active-classes',
    STUDENT_STATS: '/dashboard/student/stats',
  },

  // Class Sections
  CLASS_SECTIONS: {
    BASE: '/class-sections',
    BY_ID: (id: string) => `/class-sections/${id}`,
    SESSIONS: (id: string) => `/class-sections/${id}/sessions`,
    STUDENTS: (id: string) => `/class-sections/${id}/students`,
    SCHEDULES: (sectionId: string) => `/class-sections/${sectionId}/schedules`,
    ENROLLMENTS: (id: string) => `/class-sections/${id}/enrollments`,
  },

  // Section Schedules
  SECTION_SCHEDULES: {
    BASE: '/section-schedules',
    BY_ID: (id: string) => `/section-schedules/${id}`,
  },

  // Attendance Management
  ATTENDANCE: {
    CHECK_IN: '/attendance/check-in',
    JOB_STATUS: (jobId: string) => `/attendance/jobs/${jobId}/status`,
    TODAY_SESSIONS_STUDENT: '/attendance/sessions/today',
    STUDENT_HISTORY: '/attendance/history',
    SESSION_DETAIL: (sessionId: string) => `/attendance/sessions/${sessionId}`,
    SESSION_BATCH_OVERRIDE: (sessionId: string) => `/attendance/sessions/${sessionId}/records`,
    SESSION_CONTROLS: (sessionId: string) => `/attendance/sessions/${sessionId}/controls`,
    SINGLE_OVERRIDE: (attendanceId: string) => `/attendance/${attendanceId}`,
    SESSION_LIVE: (sessionId: string) => `/attendance/sessions/${sessionId}/live`,
  },

  // Student Account Management (Lecturer / Admin)
  STUDENTS: {
    ACCOUNTS: '/students/accounts',
    RESET_PASSWORD: (studentId: string) => `/students/${studentId}/reset-password`,
  },

  // User Management (Admin)
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    STATUS: (id: string) => `/users/${id}/status`,
    RESET_PASSWORD: (id: string) => `/users/${id}/reset-password`,
  },

  // Room Management (Admin)
  ROOMS: {
    BASE: '/rooms',
    BY_ID: (id: string) => `/rooms/${id}`,
  },

  // Master Data
  SUBJECTS: {
    BASE: '/subjects',
    BY_ID: (id: string) => `/subjects/${id}`,
  },
  SEMESTERS: {
    BASE: '/semesters',
    BY_ID: (id: string) => `/semesters/${id}`,
  },

  // Biometrics
  BIOMETRICS: {
    REGISTER: '/biometrics/register',
    IMAGE: (studentId: string) => `/biometrics/image/${studentId}`,
    BY_STUDENT_ID: (studentId: string) => `/biometrics/${studentId}`,
  },
};
