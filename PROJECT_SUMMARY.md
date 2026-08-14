# 📱 TỔNG KẾT TRIỂN KHAI DỰ ÁN SMART ATTENDANCE MOBILE (REACT NATIVE)

Tài liệu này tổng hợp toàn bộ cấu trúc, tính năng, cơ chế kết nối API và hướng dẫn vận hành cho phiên bản ứng dụng di động **Smart Attendance System (SAS Mobile FE)**.

---

## 1. 🎯 Kiến Trúc & Phân Định Nghiệp Vụ

Dự án được xây dựng theo kiến trúc phân tách rõ ràng theo đúng yêu cầu:

```
                               ┌────────────────────────────────────────────────────────┐
                               │                 Smart Attendance Mobile                │
                               └──────────────────────────┬─────────────────────────────┘
                                                          │
                    ┌─────────────────────────────────────┴─────────────────────────────────────┐
                    │                                                                           │
       ┌────────────▼────────────┐                                                 ┌────────────▼────────────┐
       │   PHÂN HỆ SINH VIÊN     │                                                 │   GIẢNG VIÊN & ADMIN    │
       │    (100% REAL API)      │                                                 │    (100% MOCK DATA)     │
       ├─────────────────────────┤                                                 ├─────────────────────────┤
       │ • Login/Logout JWT API  │                                                 │ • Lecturer Dashboard    │
       │ • Lịch học hôm nay      │                                                 │ • Quản lý điểm danh lớp │
       │ • Check-in 3 lớp bảo mật│                                                 │ • Danh bạ sinh viên     │
       │ • Đăng ký Face AI       │                                                 │ • Duyệt đơn khiếu nại   │
       │ • Lịch sử điểm danh     │                                                 │ • Admin System Mgmt     │
       └────────────┬────────────┘                                                 └─────────────────────────┘
                    │ (Axios + Bearer + Cookie)
       ┌────────────▼────────────┐
       │   NestJS Backend API    │
       │  (Port 3001 + BullMQ)   │
       └─────────────────────────┘
```

1. **Phân hệ Giảng viên (Teacher/Lecturer) & Quản trị viên (Admin)**:
   - Hoạt động **100% bằng Mock Data**, độc lập với server, phục vụ việc demo nhanh và kiểm thử giao diện.
2. **Phân hệ Sinh viên (Student)**:
   - Kết nối **100% với Real Backend API** (`http://10.0.2.2:3001` trên Android Emulator hoặc IP LAN trên máy thật).

---

## 2. 📂 Danh Sách Các Module Đã Xây Dựng

### A. Tầng Dịch Vụ API & Quản Lý Phiên (`SAS_FE/src/services/` & `SAS_FE/src/types/`)
| Đường dẫn tệp | Vai trò / Chức năng |
| :--- | :--- |
| `src/types/studentTypes.ts` | Khai báo TypeScript DTOs chuẩn xác khớp 100% với Backend: `TodaySessionDto`, `SubmitAttendanceDto`, `JobStatusResponse`, `AttendanceHistoryDto`,... |
| `src/types/declarations.d.ts` | Khai báo kiểu cho các icon vectors (`Ionicons`, `Feather`, `MaterialCommunityIcons`). |
| `src/services/apiConfig.ts` | Quản lý Base URL kết nối Backend động (`10.0.2.2:3001` cho Android, `localhost:3001` cho iOS, hoặc IP LAN). |
| `src/services/authStorage.ts` | Lưu trữ phiên đăng nhập (`userId`, `username`, `role`, `hasRegisteredFace`) và Access Token. |
| `src/services/studentApi.ts` | Module gọi API thực tế với Axios Interceptor tự động gắn `Authorization: Bearer <token>` và `withCredentials: true`: <br>• `login()`, `logout()`<br>• `getTodaySessions()` (`GET /attendance/sessions/today`)<br>• `registerFace()` (`POST /biometrics/register`)<br>• `submitCheckIn()` (`POST /attendance/check-in`)<br>• `getJobStatus()` (`GET /attendance/jobs/:jobId/status`)<br>• `getStudentHistory()` (`GET /attendance/history`) |

---

### B. Bộ Màn Hình Sinh Viên (`SAS_FE/src/screens/Student/`)
| Màn hình | Chi tiết nghiệp vụ |
| :--- | :--- |
| **`StudentDashboardScreen.tsx`** | • Hiển thị danh sách các ca học hôm nay lấy từ Server.<br>• Huy hiệu trạng thái: `Not Checked In`, `✓ Present`, `⚠️ Late`, `✕ Absent`.<br>• Cảnh báo đăng ký khuôn mặt nếu chưa có dữ liệu biometric.<br>• Nút "Check-In Now" mở màn hình điểm danh.<br>• Kéo xuống để làm mới (Pull-to-Refresh). |
| **`StudentCheckInScreen.tsx`** | • Kiểm tra 3 lớp: `🌐 Network IP`, `📍 GPS Geofencing`, `👤 Face Biometrics AI`.<br>• Thu thập tọa độ GPS và ảnh chụp khuôn mặt.<br>• Gửi payload lên hàng đợi BullMQ và tự động polling `GET /attendance/jobs/:jobId/status` mỗi 1.5s.<br>• Modal kết quả chi tiết: Báo thành công kèm độ tin cậy AI hoặc lý do từ chối (ngoài bán kính, mặt không khớp,...). |
| **`StudentFaceRegisterScreen.tsx`** | • Hướng dẫn chụp chân dung đúng chuẩn.<br>• Khung chụp ảnh và gửi multipart lên `POST /biometrics/register` để AI Service trích xuất vector 512 chiều. |
| **`StudentHistoryScreen.tsx`** | • Tải toàn bộ lịch sử điểm danh từ server.<br>• Thống kê tỷ lệ tham gia (%) và số buổi Present/Late/Absent.<br>• Bộ lọc All / Present / Late / Absent và thanh tìm kiếm. |
| **`StudentProfileScreen.tsx`** | • Xem thông tin sinh viên, trạng thái Face ID.<br>• Cho phép cấu hình IP Backend trực tiếp trên UI mà không cần sửa code.<br>• Nút Đăng xuất an toàn qua `POST /auth/logout`. |

---

### C. Điều Hướng & Đăng Nhập (`SAS_FE/src/navigation/` & `SAS_FE/src/screens/Login/`)
| Tệp tin | Vai trò |
| :--- | :--- |
| **`StudentTabNavigator.tsx`** | Bottom Tab Navigator 3 tab riêng cho Sinh viên: `Dashboard`, `History`, `Profile`. |
| **`Login.tsx`** | • Gọi API `POST /auth/login` xác thực với Backend.<br>• Tự động điều hướng theo `role` trả về (`student` ➔ StudentHome, `lecturer` ➔ Home, `admin` ➔ AdminHome).<br>• **3 nút Quick Preview Modes**: Cho phép vào thẳng bất kỳ vai trò nào khi cần demo nhanh. |
| **`App.tsx`** | Khai báo cấu trúc Stack Navigation toàn ứng dụng. |

---

## 3. 🔐 Cơ Chế Xác Thực & Quản Lý Token

1. **2 Lớp Bảo Vệ Token (Cookie + Authorization Bearer Header)**:
   - Khi đăng nhập thành công, Backend gửi cookie `access_token` và ứng dụng lưu lại token.
   - Axios Interceptor trong `studentApi.ts` tự động chèn header:
     ```http
     Authorization: Bearer <access_token>
     ```
   - Backend `jwt-auth.guard.ts` hỗ trợ đồng thời cả trích xuất Cookie và Bearer Header, đảm bảo kết nối từ Mobile không bao giờ bị nghẽn.
2. **Cơ chế Thu hồi Token khi Đăng xuất (Redis Blacklist)**:
   - Khi sinh viên nhấn **Log Out Account**, client gửi `POST /auth/logout`.
   - Backend đưa ID của Token (`jti`) vào Redis Blacklist với thời gian sống tương ứng, ngăn chặn việc sử dụng lại token cũ.

---

## 4. 🌐 Thiết Lập IP Kết Nối Backend

| Thiết bị chạy ứng dụng | Địa chỉ IP sử dụng | Ghi chú |
| :--- | :--- | :--- |
| **Android Emulator** | `http://10.0.2.2:3001` | Mặc định tự động nhận diện trên Android |
| **iOS Simulator** | `http://localhost:3001` | Mặc định tự động nhận diện trên iOS |
| **Điện thoại thật (Physical Device)** | `http://<IP_LAN_CỦA_MÁY_TÍNH>:3001`<br>*(Ví dụ: `http://192.168.1.179:3001`)* | Cài đặt trực tiếp tại tab **Profile ➔ Backend API Host Configuration** |

---

## 5. 👥 Danh Sách Tài Khoản Kiểm Thử Từ Database Seed

| Vai trò | Username | Password | Luồng dữ liệu |
| :--- | :--- | :--- | :--- |
| **Sinh viên (Student)** | `stu_2211001`<br>`stu_2211002`<br>`stu_minhnghia` | `SeedPass@2025` | 🟢 **Real API (Kết nối trực tiếp NestJS Backend)** |
| **Giảng viên (Lecturer)** | `lec_nguyen`<br>`lec_tran` | `SeedPass@2025` | 🟡 **Mock Data (Dữ liệu mẫu độc lập)** |
| **Quản trị viên (Admin)** | `admin` | `SeedPass@2025` | 🟡 **Mock Data (Dữ liệu mẫu độc lập)** |

---

## 6. 🚀 Lệnh Kiểm Tra & Khởi Chạy Ứng Dụng

Tại thư mục `SAS_FE`:

```bash
# 1. Kiểm tra TypeScript typecheck
npx tsc --noEmit

# 2. Khởi chạy Metro Bundler
npm start

# 3. Chạy trên thiết bị Android
npm run android

# 4. Chạy trên thiết bị iOS (macOS)
npm run ios
```
