import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { PaginatedResponse } from '../types/common.types';
import {
  ClassSectionResponse,
  ClassSectionDetailResponse,
  ClassSectionQuery,
  PaginatedClassSessionResponseDto,
  PaginatedEnrolledStudentResponseDto,
  SectionScheduleSummary,
} from '../types/classSection.types';

export const lecturerSectionService = {
  /**
   * List assigned class sections for the authenticated lecturer
   * GET /class-sections
   */
  async listSections(
    query?: ClassSectionQuery,
  ): Promise<PaginatedResponse<ClassSectionResponse>> {
    const params: Record<string, any> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.q?.trim()) params.search = query.q.trim();
    if (query?.search?.trim()) params.search = query.search.trim();
    if (query?.semesterId) params.semesterId = query.semesterId;
    if (query?.subjectId) params.subjectId = query.subjectId;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;

    const response = await apiClient.get<PaginatedResponse<ClassSectionResponse>>(
      API_ENDPOINTS.CLASS_SECTIONS.BASE,
      { params },
    );
    return response.data;
  },

  /**
   * Get class section details by ID
   * GET /class-sections/:id
   */
  async getSectionById(id: string): Promise<ClassSectionDetailResponse> {
    const response = await apiClient.get<ClassSectionDetailResponse>(
      API_ENDPOINTS.CLASS_SECTIONS.BY_ID(id),
    );
    return response.data;
  },

  /**
   * List class sessions for a section with attendance summaries
   * GET /class-sections/:id/sessions
   */
  async getSectionSessions(
    id: string,
    query?: { page?: number; limit?: number; status?: string; startDate?: string; endDate?: string },
  ): Promise<PaginatedClassSessionResponseDto> {
    const params: Record<string, any> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.status) params.status = query.status;
    if (query?.startDate) params.startDate = query.startDate;
    if (query?.endDate) params.endDate = query.endDate;

    const response = await apiClient.get<PaginatedClassSessionResponseDto>(
      API_ENDPOINTS.CLASS_SECTIONS.SESSIONS(id),
      { params },
    );
    return response.data;
  },

  /**
   * List enrolled students for a section with calculated attendance rates
   * GET /class-sections/:id/students
   */
  async getSectionStudents(
    id: string,
    query?: { page?: number; limit?: number; search?: string; q?: string },
  ): Promise<PaginatedEnrolledStudentResponseDto> {
    const params: Record<string, any> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    const searchTerm = query?.search?.trim() || query?.q?.trim();
    if (searchTerm) params.search = searchTerm;

    const response = await apiClient.get<PaginatedEnrolledStudentResponseDto>(
      API_ENDPOINTS.CLASS_SECTIONS.STUDENTS(id),
      { params },
    );
    return response.data;
  },

  /**
   * List schedules for a section
   * GET /class-sections/:sectionId/schedules
   */
  async getSchedulesBySection(sectionId: string): Promise<SectionScheduleSummary[]> {
    const response = await apiClient.get<SectionScheduleSummary[]>(
      API_ENDPOINTS.CLASS_SECTIONS.SCHEDULES(sectionId),
    );
    return response.data;
  },
};

export default lecturerSectionService;
