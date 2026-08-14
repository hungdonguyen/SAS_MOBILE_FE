/**
 * Centralized backend API endpoint paths.
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

  // Class Sections
  CLASS_SECTIONS: {
    BASE: '/class-sections',
    BY_ID: (id: string) => `/class-sections/${id}`,
    SCHEDULES: (sectionId: string) => `/class-sections/${sectionId}/schedules`,
  },

  // Section Schedules
  SECTION_SCHEDULES: {
    BASE: '/section-schedules',
    BY_ID: (id: string) => `/section-schedules/${id}`,
  },

  // Master Data (Optional lookups)
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
