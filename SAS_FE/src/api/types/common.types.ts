export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  statusCode: number;
  error: {
    code: string;
    message: string | string[];
    details?: any;
  };
  timestamp: string;
}

export interface ApiMessageResponse {
  message: string;
}
