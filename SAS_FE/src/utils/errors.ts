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
  [ErrorCode.INVALID_CREDENTIALS]: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
  [ErrorCode.TOKEN_EXPIRED]: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  [ErrorCode.ACCOUNT_LOCKED]: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
  [ErrorCode.UNAUTHORIZED]: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
  [ErrorCode.FORBIDDEN]: 'Bạn không có quyền truy cập tài nguyên này.',

  [ErrorCode.SESSION_EXPIRED]: 'Buổi học đã kết thúc hoặc chưa bắt đầu.',
  [ErrorCode.SESSION_NOT_FOUND]: 'Không tìm thấy buổi học.',
  [ErrorCode.FACE_NOT_MATCHED]: 'Khuôn mặt không khớp. Vui lòng thử lại.',
  [ErrorCode.FACE_NOT_REGISTERED]: 'Chưa đăng ký khuôn mặt. Vui lòng đăng ký trước khi điểm danh.',
  [ErrorCode.LOCATION_REJECTED]: 'Vị trí của bạn nằm ngoài phạm vi phòng học.',
  [ErrorCode.ALREADY_CHECKED_IN]: 'Bạn đã điểm danh cho buổi học này rồi.',

  [ErrorCode.FILE_TOO_LARGE]: 'Kích thước file vượt quá giới hạn cho phép.',
  [ErrorCode.INVALID_FILE_TYPE]: 'Định dạng file không được hỗ trợ.',
  [ErrorCode.VALIDATION_ERROR]: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',

  [ErrorCode.NETWORK_ERROR]: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
  [ErrorCode.TIMEOUT]: 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.',
  [ErrorCode.SERVER_ERROR]: 'Máy chủ gặp sự cố. Vui lòng thử lại sau.',
  [ErrorCode.TOO_MANY_REQUESTS]: 'Bạn đã thao tác quá nhiều lần. Vui lòng đợi một lát rồi thử lại.',
  [ErrorCode.NOT_FOUND]: 'Không tìm thấy tài nguyên yêu cầu.',
  [ErrorCode.UNKNOWN]: 'Đã xảy ra lỗi không xác định.',
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

  // Nếu là lỗi mạng (không kết nối được tới server)
  if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
    return ERROR_MESSAGES[ErrorCode.NETWORK_ERROR];
  }

  const response = error.response;
  if (response) {
    const statusCode = response.status;
    const body = response.data;
    
    // 1. Nếu backend có trả về message cụ thể, ưu tiên lấy message đó
    const serverMessage = body?.error?.message || body?.message;
    
    // 2. Nếu không có message, xem có trả về mã code không
    const rawCode = body?.error?.code || body?.code || body?.errorCode;
    
    // 3. Ưu tiên dùng ERROR_MESSAGES mapping nếu rawCode khớp
    if (rawCode && ERROR_MESSAGES[rawCode]) {
      return ERROR_MESSAGES[rawCode];
    }
    
    // 4. Nếu backend trả về string message thuần túy, hiển thị thẳng
    if (serverMessage) {
      if (typeof serverMessage === 'string') return serverMessage;
      if (Array.isArray(serverMessage) && serverMessage.length > 0) return serverMessage.join(', ');
    }
    
    // 5. Fallback: suy đoán dựa vào HTTP Status Code
    const fallbackCode = mapStatusToErrorCode(statusCode);
    return ERROR_MESSAGES[fallbackCode];
  }

  return error.message || ERROR_MESSAGES[ErrorCode.UNKNOWN];
}
