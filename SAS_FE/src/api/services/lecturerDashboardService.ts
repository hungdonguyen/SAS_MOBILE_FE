import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  LecturerStatsResponseDto,
  LecturerTodaySessionDto,
} from '../types/dashboard.types';

export const lecturerDashboardService = {
  /**
   * Get KPI statistics for lecturer dashboard
   * GET /dashboard/lecturer/stats
   */
  async getLecturerStats(): Promise<LecturerStatsResponseDto> {
    const response = await apiClient.get<LecturerStatsResponseDto>(
      API_ENDPOINTS.DASHBOARD.LECTURER_STATS,
    );
    return response.data;
  },

  /**
   * Get today's class sessions for the requesting lecturer
   * GET /dashboard/lecturer/today-sessions
   */
  async getLecturerTodaySessions(): Promise<LecturerTodaySessionDto[]> {
    const response = await apiClient.get<LecturerTodaySessionDto[]>(
      API_ENDPOINTS.DASHBOARD.LECTURER_TODAY_SESSIONS,
    );
    return response.data;
  },
};

export default lecturerDashboardService;
