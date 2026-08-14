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
       │   PHÂN HỆ SINH VIÊN     │                                                 │   PHÂN HỆ GIẢNG VIÊN    │
       │    (100% REAL API)      │                                                 │    (100% REAL API)      │
       ├─────────────────────────┤                                                 ├─────────────────────────┤
       │ • Login/Logout JWT API  │                                                 │ • Lecturer Dashboard    │
       │ • Lịch học hôm nay      │                                                 │ • Quản lý lớp học & ca  │
       │ • Check-in 3 lớp bảo mật│                                                 │ • Danh bạ sinh viên lớp │
       │ • Đăng ký Face AI       │                                                 │ • Điểm danh thủ công    │
       │ • Lịch sử điểm danh     │                                                 │ • Cài đặt & Hồ sơ       │
       └────────────┬────────────┘                                                 └────────────┬────────────┘
                    │ (Axios + Bearer + Cookie)                                                 │ (Axios + Bearer + Cookie)
       ┌────────────▼───────────────────────────────────────────────────────────────────────────▼────────────┐
       │                                         NestJS Backend API                                          │
       │                                     (Port 3001 + BullMQ + Redis)                                    │
       └─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Phân hệ Giảng viên (Lecturer)**:
   - Kết nối **100% với Real Backend API** (`http://10.0.2.2:3001` trên Android Emulator hoặc IP LAN trên máy thật).
   - Dashboard KPI stats (`GET /dashboard/lecturer/stats`), Today sessions (`GET /dashboard/lecturer/today-sessions`), Class sections (`GET /class-sections`), Sessions list (`GET /class-sections/:id/sessions`), Session attendance roster (`GET /attendance/sessions/:sessionId`), và Batch manual attendance override (`PATCH /attendance/sessions/:sessionId/records`).
2. **Phân hệ Sinh viên (Student)**:
   - Kết nối **100% với Real Backend API**.
3. **Phân hệ Quản trị viên (Admin)**:
   - Hoạt động bằng Mock Data / Admin endpoints độc lập phục vụ kiểm thử.

---

## 2. 📂 Danh Sách Các Module Đã Xây Dựng

### A. Tầng Dịch Vụ API & Quản Lý Phiên (`src/api/` & `src/services/`)
| Đường dẫn tệp | Vai trò / Chức năng |
| :--- | :--- |
| `src/api/client.ts` | Axios instance cấu hình sẵn `withCredentials: true`, timeout, header JSON. |
| `src/api/interceptors.ts` | Request Auth interceptor gắn `Authorization: Bearer <token>`, Response interceptor xử lý 401 refresh token và chuẩn hoá message lỗi. |
| `src/api/config.ts` | Quản lý Base URL động (`10.0.2.2:3001` trên Android, `localhost:3001` trên iOS, hoặc IP LAN). |
| `src/api/storage.ts` | Quản lý phiên đăng nhập (`userId`, `username`, `role`, `hasRegisteredFace`) và Access Token. |
| `src/api/endpoints.ts` | Từ điển tập trung toàn bộ endpoint backend. |
| `src/api/services/authService.ts` | Đăng nhập (`POST /auth/login`), Đăng xuất (`POST /auth/logout`), Thông tin profile (`GET /auth/me`). |
| `src/api/services/lecturerDashboardService.ts` | Lấy KPI stats (`GET /dashboard/lecturer/stats`) và lịch dạy hôm nay (`GET /dashboard/lecturer/today-sessions`). |
| `src/api/services/lecturerSectionService.ts` | Danh sách lớp (`GET /class-sections`), Chi tiết lớp (`GET /class-sections/:id`), Danh sách ca học (`GET /class-sections/:id/sessions`), Danh sách sinh viên enrolled (`GET /class-sections/:id/students`). |
| `src/api/services/lecturerAttendanceService.ts` | Bảng điểm danh ca học (`GET /attendance/sessions/:sessionId`), Điểm danh thủ công hàng loạt (`PATCH /attendance/sessions/:sessionId/records`). |
| `src/api/services/disputeService.ts` | Adapter dữ liệu khiếu nại (Disputes) sẵn sàng cho tương lai. |

---

### B. Bộ Màn Hình Giảng Viên (`src/screens/Dashboard/`, `src/screens/Classes/`, `src/screens/Students/`, `src/screens/Settings/`)
| Màn hình | Chi tiết nghiệp vụ & Kết nối API |
| :--- | :--- |
| **`LecturerDashboard.tsx`** | • Hiển thị 4 thẻ KPI (`Assigned Classes`, `Students`, `Attendance Rate`, `Today Sessions`) từ `GET /dashboard/lecturer/stats`.<br>• Danh sách ca dạy hôm nay kèm số lượng đã check-in từ `GET /dashboard/lecturer/today-sessions`.<br>• Bộ lọc All / Ongoing / Upcoming và Pull-to-Refresh. |
| **`ClassesListScreen.tsx`** | • Danh sách các lớp được phân công từ `GET /class-sections`.<br>• Hiển thị mã lớp, tên môn, phòng học, lịch học, sĩ số sinh viên.<br>• Chạm vào lớp để xem chi tiết ca học và điểm danh. |
| **`ClassDetailScreen.tsx`** | • Chi tiết lớp học và danh sách ca học từ `GET /class-sections/:id/sessions`.<br>• Danh sách điểm danh sinh viên với thông tin thiết bị, thời gian, phương thức (AI/Manual) từ `GET /attendance/sessions/:sessionId`.<br>• Bộ chọn trạng thái `Present / Late / Absent / Excused` và nút **Save changes** gửi batch override lên `PATCH /attendance/sessions/:sessionId/records`. |
| **`StudentsScreen.tsx`** | • Danh bạ sinh viên thuộc các lớp giảng viên phụ trách từ `GET /class-sections/:id/students`.<br>• Tỷ lệ chuyên cần và nhãn trạng thái `Good / Warning / Critical`. |
| **`DisputesScreen.tsx`** | • Duyệt đơn khiếu nại điểm danh sinh viên (Approve / Reject). |
| **`SettingsScreen.tsx`** | • Thông tin giảng viên từ `GET /auth/me`.<br>• Cấu hình IP Host Backend API.<br>• Nút đăng xuất qua `POST /auth/logout`. |

---

## 3. 👥 Danh Sách Tài Khoản Kiểm Thử

| Vai trò | Username | Password | Luồng dữ liệu |
| :--- | :--- | :--- | :--- |
| **Giảng viên (Lecturer)** | `lec_nguyen`<br>`lec_tran` | `SeedPass@2025` | 🟢 **Real API (Kết nối trực tiếp NestJS Backend)** |
| **Sinh viên (Student)** | `stu_2211001`<br>`stu_2211002`<br>`stu_minhnghia` | `SeedPass@2025` | 🟢 **Real API (Kết nối trực tiếp NestJS Backend)** |
| **Quản trị viên (Admin)** | `admin` | `SeedPass@2025` | 🟡 **Mock Data / Admin Service** |

---

## 4. 🚀 Lệnh Kiểm Tra

Tại thư mục `SAS_FE`:

```bash
# 1. Kiểm tra TypeScript typecheck
npx tsc --noEmit

# 2. Khởi chạy Metro Bundler
npm start

# 3. Chạy trên thiết bị Android
npm run android
```
