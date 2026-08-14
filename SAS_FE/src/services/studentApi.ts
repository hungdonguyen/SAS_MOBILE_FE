import axios, { AxiosInstance, AxiosError } from 'axios';
import { apiConfig } from './apiConfig';
import { authStorage } from './authStorage';
import { NavigationService } from './navigationService';
import {
  TodaySessionDto,
  SubmitAttendanceDto,
  AttendanceQueuedResponse,
  JobStatusResponse,
  AttendanceHistoryDto,
  LoginResponse,
  MeResponse,
} from '../types/studentTypes';

// ─── Singleton refresh state ─────────────────────────────────────────────────
// Prevents multiple concurrent 401s from triggering multiple refresh calls.
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// ─── Axios client factory ────────────────────────────────────────────────────
const createClient = (): AxiosInstance => {
  const instance = axios.create({
    // No baseURL here — set dynamically per request so IP changes apply immediately
    withCredentials: true,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // REQUEST: always read current baseURL and token fresh on every request
  instance.interceptors.request.use((config) => {
    config.baseURL = apiConfig.getBaseUrl();
    const token = authStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // RESPONSE: handle 401 → attempt token refresh → retry → logout if failed
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // Only handle 401 and avoid infinite retry loops
      if (
        error.response?.status !== 401 ||
        originalRequest._retry ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/login')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          // Retry original request with the new token
          const newToken = authStorage.getAccessToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return instance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent token refresh via HttpOnly refresh_token cookie
        const refreshClient = axios.create({
          baseURL: apiConfig.getBaseUrl(),
          withCredentials: true, // sends refresh_token cookie automatically
          timeout: 10000,
        });

        const refreshRes = await refreshClient.post('/auth/refresh');

        // Extract new access_token from Set-Cookie header
        const setCookie = refreshRes.headers['set-cookie'];
        if (setCookie) {
          const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : String(setCookie);
          const match = cookieStr.match(/access_token=([^;]+)/);
          if (match?.[1]) {
            authStorage.setAccessToken(match[1]);
          }
        }

        processQueue(null);

        // Retry the original request with the refreshed token
        const newToken = authStorage.getAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        // Refresh failed — clear session and force re-login
        authStorage.clearUser();
        NavigationService.reset('Login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );

  return instance;
};

// ─── Student API ─────────────────────────────────────────────────────────────
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
        if (match?.[1]) {
          authStorage.setAccessToken(match[1]);
        }
      }
    } catch (e) {
      console.log('Error parsing auth cookies:', e);
    }

    if (data?.userId) {
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
   * Get current authenticated user profile
   * GET /auth/me
   */
  getMe: async (): Promise<MeResponse> => {
    const client = createClient();
    const response = await client.get<MeResponse>('/auth/me');
    // Sync hasRegisteredFace back to local storage
    if (response.data?.hasRegisteredFace !== undefined) {
      authStorage.setHasRegisteredFace(Boolean(response.data.hasRegisteredFace));
    }
    return response.data;
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
      },
    );
    authStorage.setHasRegisteredFace(true);
    return response.data;
  },

  /**
   * Fetch the student's decrypted biometric reference image.
   * Uses Axios with Authorization header (Image component cannot set headers).
   * Returns a base64 data URI string, or null if no face registered / error.
   * GET /biometrics/image/:studentId
   */
  fetchBiometricImageBase64: async (studentId: string): Promise<string | null> => {
    try {
      const token = authStorage.getAccessToken();
      const base = apiConfig.getBaseUrl();
      const response = await axios.get(`${base}/biometrics/image/${studentId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        responseType: 'arraybuffer',
        timeout: 10000,
        withCredentials: true,
      });
      const bytes = new Uint8Array(response.data as ArrayBuffer);
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let base64 = '';
      for (let i = 0; i < bytes.length; i += 3) {
        const b0 = bytes[i];
        const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
        const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
        base64 += chars[b0 >> 2];
        base64 += chars[((b0 & 3) << 4) | (b1 >> 4)];
        base64 += i + 1 < bytes.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
        base64 += i + 2 < bytes.length ? chars[b2 & 63] : '=';
      }
      const mimeType = response.headers['content-type'] || 'image/jpeg';
      return `data:${mimeType};base64,${base64}`;
    } catch (err) {
      return null;
    }
  },

  /**
   * Submit 3-layer check-in data to BullMQ queue
   * POST /attendance/check-in
   */
  submitCheckIn: async (dto: SubmitAttendanceDto): Promise<AttendanceQueuedResponse> => {
    const client = createClient();
    const response = await client.post<AttendanceQueuedResponse>(
      '/attendance/check-in',
      dto,
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
      `/attendance/jobs/${encodeURIComponent(jobId)}/status`,
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
