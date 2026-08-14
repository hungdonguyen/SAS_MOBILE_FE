import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { PaginatedResponse, ApiMessageResponse } from '../types/common.types';
import {
  ClassSectionResponse,
  ClassSectionDetailResponse,
  SectionScheduleSummary,
  ClassSectionQuery,
} from '../types/classSection.types';

export const classSectionService = {
  /**
   * List class sections with pagination and filters.
   */
  async listSections(query?: ClassSectionQuery): Promise<PaginatedResponse<ClassSectionResponse>> {
    const params: Record<string, any> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.q?.trim()) params.q = query.q.trim();
    if (query?.semesterId) params.semesterId = query.semesterId;
    if (query?.subjectId) params.subjectId = query.subjectId;
    if (query?.lecturerId) params.lecturerId = query.lecturerId;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;

    const response = await apiClient.get<PaginatedResponse<ClassSectionResponse>>(
      API_ENDPOINTS.CLASS_SECTIONS.BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Get class section detail including schedules and enrollment count.
   */
  async getSectionById(id: string): Promise<ClassSectionDetailResponse> {
    const response = await apiClient.get<ClassSectionDetailResponse>(
      API_ENDPOINTS.CLASS_SECTIONS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Get schedules for a section.
   */
  async getSchedulesBySection(sectionId: string): Promise<SectionScheduleSummary[]> {
    const response = await apiClient.get<SectionScheduleSummary[]>(
      API_ENDPOINTS.CLASS_SECTIONS.SCHEDULES(sectionId)
    );
    return response.data;
  },

  /**
   * Create a class section.
   */
  async createSection(payload: { subjectId: string; semesterId: string; lecturerId: string }): Promise<ClassSectionResponse> {
    const response = await apiClient.post<ClassSectionResponse>(
      API_ENDPOINTS.CLASS_SECTIONS.BASE,
      payload
    );
    return response.data;
  },

  /**
   * Delete class section.
   */
  async deleteSection(id: string): Promise<ApiMessageResponse & { deletedSectionId: string }> {
    const response = await apiClient.delete<ApiMessageResponse & { deletedSectionId: string }>(
      API_ENDPOINTS.CLASS_SECTIONS.BY_ID(id)
    );
    return response.data;
  },
};

export default classSectionService;
