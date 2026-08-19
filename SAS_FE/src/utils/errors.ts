/**
 * 🛡️ Error Types & Codes — Hệ thống phân loại lỗi chuẩn hóa
 * Ported from Web project
 */

export enum ErrorCode {
  // Auth errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Attendance errors
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  FACE_NOT_MATCHED = 'FACE_NOT_MATCHED',
  FACE_NOT_REGISTERED = 'FACE_NOT_REGISTERED',
  LOCATION_REJECTED = 'LOCATION_REJECTED',
  ALREADY_CHECKED_IN = 'ALREADY_CHECKED_IN',
  
  // AI errors
  LIVENESS_FAILED = 'LIVENESS_FAILED',
  NO_FACE_DETECTED = 'NO_FACE_DETECTED',
  MULTIPLE_FACES_DETECTED = 'MULTIPLE_FACES_DETECTED',

  // Upload / Validation errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Network / Generic errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

export const ERROR_MESSAGES: Record<string, string> = {
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid username or password.',
  [ErrorCode.TOKEN_EXPIRED]: 'Session expired. Please log in again.',
  [ErrorCode.ACCOUNT_LOCKED]: 'Account is locked. Please contact the administrator.',
  [ErrorCode.UNAUTHORIZED]: 'Invalid or expired session. Please log in again.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to access this resource.',

  [ErrorCode.SESSION_EXPIRED]: 'Class session has ended or has not started.',
  [ErrorCode.SESSION_NOT_FOUND]: 'Class session not found.',
  [ErrorCode.FACE_NOT_MATCHED]: 'Face does not match. Please try again.',
  [ErrorCode.FACE_NOT_REGISTERED]: 'Biometric face is not registered. Please register before check-in.',
  [ErrorCode.LOCATION_REJECTED]: 'Your location is outside the classroom geofence.',
  [ErrorCode.ALREADY_CHECKED_IN]: 'You have already checked in for this session.',

  [ErrorCode.LIVENESS_FAILED]: 'Anti-spoofing failed. Please use a live face.',
  [ErrorCode.NO_FACE_DETECTED]: 'No face detected in the photo.',
  [ErrorCode.MULTIPLE_FACES_DETECTED]: 'Multiple faces detected in the photo.',

  [ErrorCode.FILE_TOO_LARGE]: 'File size exceeds the allowed limit.',
  [ErrorCode.INVALID_FILE_TYPE]: 'Unsupported file format.',
  [ErrorCode.VALIDATION_ERROR]: 'Invalid input data. Please check and try again.',

  [ErrorCode.NETWORK_ERROR]: 'Unable to connect to server. Please check your network connection.',
  [ErrorCode.TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCode.SERVER_ERROR]: 'Server encountered an issue. Please try again later.',
  [ErrorCode.TOO_MANY_REQUESTS]: 'Too many requests. Please wait a moment and try again.',
  [ErrorCode.NOT_FOUND]: 'Requested resource not found.',
  [ErrorCode.UNKNOWN]: 'An unexpected error occurred.',
};

function mapStatusToErrorCode(statusCode: number): string {
  switch (statusCode) {
    case 400: return ErrorCode.VALIDATION_ERROR;
    case 401: return ErrorCode.INVALID_CREDENTIALS; // Map 401 directly to Invalid Credentials for login
    case 403: return ErrorCode.FORBIDDEN;
    case 404: return ErrorCode.NOT_FOUND;
    case 408: return ErrorCode.TIMEOUT;
    case 409: return ErrorCode.ALREADY_CHECKED_IN;
    case 422: return ErrorCode.VALIDATION_ERROR;
    case 429: return ErrorCode.TOO_MANY_REQUESTS;
    default:
      if (statusCode >= 500) return ErrorCode.SERVER_ERROR;
      return ErrorCode.UNKNOWN;
  }
}

/**
 * Trích xuất message thân thiện cho người dùng từ Error object (thường là lỗi của axios)
 */
export function getErrorMessage(error: any): string {
  if (!error) return ERROR_MESSAGES[ErrorCode.UNKNOWN];

  // Nếu là lỗi mạng (không kết nối được tới server hoặc timeout)
  if (
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK' ||
    error.message?.includes('Network Error') ||
    error.message?.includes('Unable to connect') ||
    (!error.response && error.request)
  ) {
    return ERROR_MESSAGES[ErrorCode.NETWORK_ERROR];
  }

  const response = error.response;
  if (response) {
    const statusCode = response.status;
    const body = response.data;
    
    // Trích xuất message từ server
    const serverMessage = body?.error?.message || body?.message;
    const rawCode = body?.error?.code || body?.code || body?.errorCode;

    // Chuẩn hóa lỗi 401 Invalid credentials
    if (
      statusCode === 401 &&
      (serverMessage === 'Invalid credentials' || rawCode === 'INVALID_CREDENTIALS' || rawCode === 'UNAUTHORIZED')
    ) {
      return ERROR_MESSAGES[ErrorCode.INVALID_CREDENTIALS];
    }
    
    // 1. Ưu tiên dùng ERROR_MESSAGES mapping nếu rawCode khớp
    if (rawCode && ERROR_MESSAGES[rawCode]) {
      return ERROR_MESSAGES[rawCode];
    }
    
    // 2. Nếu backend trả về string message thuần túy, hiển thị thẳng
    if (serverMessage) {
      if (typeof serverMessage === 'string') return serverMessage;
      if (Array.isArray(serverMessage) && serverMessage.length > 0) return serverMessage.join(', ');
    }
    
    // 3. Fallback: suy đoán dựa vào HTTP Status Code
    const fallbackCode = mapStatusToErrorCode(statusCode);
    return ERROR_MESSAGES[fallbackCode];
  }

  return error.message || ERROR_MESSAGES[ErrorCode.UNKNOWN];
}
