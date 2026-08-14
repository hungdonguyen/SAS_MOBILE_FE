import axios, { AxiosInstance } from 'axios';
import { apiConfig } from './apiConfig';
import { authStorage } from './authStorage';
import {
  TodaySessionDto,
  SubmitAttendanceDto,
  AttendanceQueuedResponse,
  JobStatusResponse,
  AttendanceHistoryDto,
  LoginResponse,
} from '../types/studentTypes';

const createClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: apiConfig.getBaseUrl(),
    withCredentials: true,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Attach Bearer token to Authorization header if stored
  instance.interceptors.request.use((config) => {
    const token = authStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

export const studentApi = {
  /**
   * Authenticate student credentials with Backend NestJS
   * POST /auth/login
   */
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const client = createClient();
    const response = await client.post<LoginResponse>('/auth/login', {
      username,
      password,
    });

    const data = response.data;

    // Extract access_token from Set-Cookie headers if present
    try {
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : String(setCookie);
        const match = cookieStr.match(/access_token=([^;]+)/);
        if (match && match[1]) {
          authStorage.setAccessToken(match[1]);
        }
      }
    } catch (e) {
      console.log('Error parsing auth cookies:', e);
    }

    if (data && data.userId) {
      authStorage.setUser({
        userId: data.userId,
        username,
        role: data.role,
        hasRegisteredFace: Boolean(data.hasRegisteredFace),
      });
    }

    return data;
  },

  /**
   * Log out active student session from Backend and blacklist JWT
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      const client = createClient();
      await client.post('/auth/logout');
    } catch (e) {
      console.log('Logout API call failed or offline:', e);
    } finally {
      authStorage.clearUser();
    }
  },

  /**
   * Fetch today's assigned sessions for student dashboard
   * GET /attendance/sessions/today
   */
  getTodaySessions: async (): Promise<TodaySessionDto[]> => {
    const client = createClient();
    const response = await client.get<TodaySessionDto[]>('/attendance/sessions/today');
    return response.data;
  },

  /**
   * Register or update student biometric face image
   * POST /biometrics/register (multipart/form-data)
   */
  registerFace: async (formData: FormData): Promise<{ success: boolean; message: string }> => {
    const client = createClient();
    const response = await client.post<{ success: boolean; message: string }>(
      '/biometrics/register',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    authStorage.setHasRegisteredFace(true);
    return response.data;
  },

  /**
   * Submit 3-layer check-in data to BullMQ queue
   * POST /attendance/check-in
   */
  submitCheckIn: async (dto: SubmitAttendanceDto): Promise<AttendanceQueuedResponse> => {
    const client = createClient();
    const response = await client.post<AttendanceQueuedResponse>(
      '/attendance/check-in',
      dto
    );
    return response.data;
  },

  /**
   * Poll BullMQ attendance processing result
   * GET /attendance/jobs/:jobId/status
   */
  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    const client = createClient();
    const response = await client.get<JobStatusResponse>(
      `/attendance/jobs/${encodeURIComponent(jobId)}/status`
    );
    return response.data;
  },

  /**
   * Get student full attendance history
   * GET /attendance/history
   */
  getStudentHistory: async (): Promise<AttendanceHistoryDto[]> => {
    const client = createClient();
    const response = await client.get<AttendanceHistoryDto[]>('/attendance/history');
    return response.data;
  },
};
