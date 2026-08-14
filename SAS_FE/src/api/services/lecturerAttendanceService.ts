import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  SessionAttendanceDetailResponseDto,
  BatchAttendanceOverrideDto,
  SingleAttendanceOverrideDto,
  SessionControlsResponseDto,
} from '../types/attendance.types';

export const lecturerAttendanceService = {
  /**
   * Get full session attendance roster with biometric telemetry & summary
   * GET /attendance/sessions/:sessionId
   */
  async getSessionAttendance(
    sessionId: string,
    query?: { status?: string; q?: string; page?: number; limit?: number },
  ): Promise<SessionAttendanceDetailResponseDto> {
    const response = await apiClient.get<SessionAttendanceDetailResponseDto>(
      API_ENDPOINTS.ATTENDANCE.SESSION_DETAIL(sessionId),
      { params: query },
    );
    return response.data;
  },

  /**
   * Batch manual override of attendance records for a session
   * PATCH /attendance/sessions/:sessionId/records
   */
  async batchOverrideAttendance(
    sessionId: string,
    dto: BatchAttendanceOverrideDto,
  ): Promise<{ overridden: number; failed: string[] }> {
    const response = await apiClient.patch<{ overridden: number; failed: string[] }>(
      API_ENDPOINTS.ATTENDANCE.SESSION_BATCH_OVERRIDE(sessionId),
      dto,
    );
    return response.data;
  },

  /**
   * Override a single attendance record
   * PATCH /attendance/:attendanceId
   */
  async singleOverrideAttendance(
    attendanceId: string,
    dto: SingleAttendanceOverrideDto,
  ): Promise<{ message: string; record: any }> {
    const response = await apiClient.patch<{ message: string; record: any }>(
      API_ENDPOINTS.ATTENDANCE.SINGLE_OVERRIDE(attendanceId),
      dto,
    );
    return response.data;
  },

  /**
   * Toggle session security validation controls
   * PATCH /attendance/sessions/:sessionId/controls
   */
  async updateSessionControls(
    sessionId: string,
    dto: {
      networkValidationEnabled?: boolean;
      gpsValidationEnabled?: boolean;
      faceValidationEnabled?: boolean;
    },
  ): Promise<SessionControlsResponseDto> {
    const response = await apiClient.patch<SessionControlsResponseDto>(
      API_ENDPOINTS.ATTENDANCE.SESSION_CONTROLS(sessionId),
      dto,
    );
    return response.data;
  },
};

export default lecturerAttendanceService;
