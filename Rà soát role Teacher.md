# 📋 Báo cáo Rà soát Role Teacher — MeiLearning System

> **Thực hiện:** Senior Developer (10 năm kinh nghiệm)  
> **Ngày rà soát:** 19/03/2026  
> **Phạm vi:** Toàn bộ Frontend + Backend liên quan đến role Teacher  
> **Trạng thái hệ thống:** Sau các fix đã triển khai trong phiên làm việc hiện tại

---

## 1. 🔴 Các phần đang Hardcode

### 1.1 Module Dashboard (`TeacherDashboard.tsx`)
| Vấn đề | Mức độ | Chi tiết |
|--------|--------|---------|
| `authService.getCurrentTeacherId()` gọi ở **top-level component** | 🔴 Cao | Nếu user null → `throw Error` → crash toàn bộ trang |
| `useWeekSessions(undefined, TEACHER_ID)` dùng **admin hook** | 🔴 Cao | Gọi sai endpoint `/schedule` (admin), không filter đúng teacher |
| `MOCK_PENDING_TASKS`, `MOCK_ATTENDANCE_RATE` trong `dashboardService.ts` | 🟡 Trung bình | Mock data tĩnh cho pending tasks và tỉ lệ điểm danh |

### 1.2 Module Documents (`TeacherDocumentsPage.tsx`)
| Vấn đề | Mức độ | Chi tiết |
|--------|--------|---------|
| `mockDocuments` — mảng 6 tài liệu hardcode | 🔴 Cao | Toàn bộ danh sách tài liệu là tĩnh, không gọi API |
| `availableClasses` — danh sách lớp hardcode | 🔴 Cao | `{ id: "1", name: "Toán 10A" }` — dữ liệu giả thuần tuý |
| `const classes` — dropdown lớp hardcode | 🔴 Cao | Cùng với trên, không lấy từ API |
| `handleUpload` / `handleDelete` — không gọi API | 🔴 Cao | Chỉ hiển thị toast, không persist dữ liệu thật |
| `handleShare` — không gọi API | 🔴 Cao | Không có tích hợp backend chia sẻ tài liệu |

### 1.3 Module Attendance (`attendanceService.ts`)
| Vấn đề | Mức độ | Chi tiết |
|--------|--------|---------|
| `getTeacherSessions` gọi `GET /schedule?teacherId=X` | 🔴 Cao | Endpoint sai — `/schedule` là tổng admin, không filter đúng |
| `authService.getCurrentTeacherId()` trong `useAttendance.ts` ln 12 | 🟡 Trung bình | Trả về User ID (≠ Teacher entity ID), có thể gây lọc sai |

### 1.4 Module Exams (`examService.ts`)
| Vấn đề | Mức độ | Chi tiết |
|--------|--------|---------|
| `GET /exams/stats` — endpoint không tồn tại trên Backend | 🔴 Cao | Backend `ExamController` không có `/stats` endpoint |
| `GET /exams/{id}/info`, `/statistics`, `/question-analysis` — không tồn tại | 🔴 Cao | Các endpoint này chưa được implement trong Backend |
| `PATCH /exams/{id}/archive` — không tồn tại | 🟡 Trung bình | Backend chỉ có `PATCH /publish`, không có `/archive` |

### 1.5 Module Leave (`leaveService.ts`)
| Vấn đề | Mức độ | Chi tiết |
|--------|--------|---------|
| `GET /leave/stats` — endpoint không tồn tại | 🔴 Cao | `LeaveController` không có `/stats` endpoint |
| `approveLeaveRequest` signature không match | 🟡 Trung bình | Hook truyền `(id, teacherId)` nhưng service chỉ nhận `(id)` — tham số `teacherId` bị bỏ qua |
| `rejectLeaveRequest` signature không match | 🟡 Trung bình | Hook truyền `(id, teacherId, dto)` nhưng service nhận `(id, reason: string)` — type error |

---

## 2. 🟡 Tình trạng tích hợp API

### Bảng tổng hợp trạng thái từng module

| Module | API Endpoint | Trạng thái | Ghi chú |
|--------|-------------|-----------|---------|
| **Dashboard - Lịch hôm nay** | `GET /schedule` (admin hook) | ❌ Sai endpoint | Cần dùng `/schedule/teacher/me` |
| **Dashboard - Pending Tasks** | Không có API | ❌ Mock thuần | Chưa có backend endpoint |
| **Dashboard - Attendance Rate** | `GET /attendance/stats` | ⚠️ Thiếu auth | Dùng User ID thay Teacher ID |
| **Schedule - Lịch dạy** | `GET /schedule/teacher/me` | ✅ Đã fix | Fix trong phiên này |
| **Classes - Lớp của tôi** | `GET /classes` | ✅ Hoạt động | Backend tự resolve teacher từ JWT |
| **Attendance - Buổi dạy** | `GET /schedule?teacherId=X` | ❌ Sai endpoint | Cần `/schedule/teacher/me` |
| **Attendance - Điểm danh** | `GET /attendance?sessionId=X` | ✅ Đúng | Backend filter đúng |
| **Attendance - Lưu** | `POST /attendance/bulk` | ✅ Đúng | Hoạt động bình thường |
| **Documents - Danh sách** | Không có API call | ❌ Mock hoàn toàn | Cần gọi `GET /documents` |
| **Documents - Upload** | Không có API call | ❌ Mock hoàn toàn | Cần gọi `POST /documents` |
| **Documents - Delete** | Không có API call | ❌ Mock hoàn toàn | Cần gọi `DELETE /documents/{id}` |
| **Exams - Danh sách** | `GET /exams?teacherId=X` | ⚠️ User ID ≠ Teacher ID | Xem thêm mục 1.4 |
| **Exams - Thống kê kết quả** | `GET /exams/{id}/results` | ✅ Đúng | Backend có endpoint |
| **Exams - Stats, Info, QA** | Không tồn tại trên BE | ❌ 404 | Backend chưa implement |
| **Grades - Danh sách** | `GET /grades` | Cần kiểm tra | Chưa rà soát service |
| **Reschedule - Danh sách** | `GET /reschedule?teacherId=X` | ⚠️ User ID ≠ Teacher ID | teacherId truyền lên sai |
| **Reschedule - Tạo** | `POST /reschedule` | ⚠️ User ID ≠ Teacher ID | teacherId trong body sai |
| **Leave - Danh sách** | `GET /leave` | ⚠️ Thiếu filter đúng | Lấy tất cả đơn, không filter teacher |
| **Leave - Stats** | `GET /leave/stats` | ❌ 404 | BE không có endpoint này |
| **Leave - Approve/Reject** | `PATCH /leave/{id}/approve` | ✅ Đúng endpoint | Signature hook vs service lệch nhau |
| **Notifications** | `GET /notifications` | ✅ Hoạt động | Backend resolve từ JWT đúng |
| **Profile** | `GET /profile/me`, `PUT /profile/me` | ✅ Hoạt động | Module chuẩn nhất |

---

## 3. 💡 Các điểm cần cải thiện

### 3.1 Vấn đề kiến trúc căn bản (User ID ≠ Teacher ID)
> **Đây là lỗi mang tính hệ thống, ảnh hưởng 5+ module**

Backend có 2 bảng riêng biệt:
- `user` (id, username, role, ...) — `user.id` được lưu trong localStorage
- `teacher` (id, user_id, ...) — **Teacher entity ID**, dùng trong các query điểm danh, lịch dạy,...

`authService.getCurrentTeacherId()` trả về `user.id`, nhưng các service lại dùng nó để truyền vào các endpoint cần `teacher.id` → **sai hoàn toàn**.

**Giải pháp đã áp dụng cho Schedule:** Backend thêm endpoint `GET /schedule/teacher/me` — tự resolve teacher từ JWT (không cần FE truyền ID).  
**Cần nhân rộng pattern này** cho Attendance, Exams, Reschedule.

### 3.2 Documents — Chưa tích hợp API hoàn toàn
Module Documents là module kém nhất: 100% mock data, cả list, upload, delete, share đều không persist. Backend đã có `DocumentController` đầy đủ nhưng Frontend hoàn toàn chưa gọi.

### 3.3 Missing Backend Endpoints
Các endpoint sau được Frontend gọi nhưng **không tồn tại** trên Backend:
- `GET /exams/stats`
- `GET /exams/{id}/info`
- `GET /exams/{id}/statistics`  
- `GET /exams/{id}/question-analysis`
- `PATCH /exams/{id}/archive`
- `GET /leave/stats`

### 3.4 authService gọi trong top-level render
Nhiều component gọi `authService.getCurrentTeacherId()` trực tiếp trong body component (ngoài hook/memo), gây crash nếu session hết hạn.

---

## 4. 📝 Plan các Task cần thực hiện

### 🔴 Priority 1 — Critical Bugs (Cần fix ngay)

- [ ] **[BE] Task 1.1** — Thêm endpoint `GET /api/v1/attendance/sessions/teacher/me` — trả danh sách buổi dạy của teacher đang đăng nhập (resolve từ JWT), thay thế việc FE truyền teacherId sai
- [ ] **[FE] Task 1.2** — Cập nhật `attendanceService.getTeacherSessions()` để gọi endpoint mới thay vì `GET /schedule?teacherId=X`
- [ ] **[FE] Task 1.3** — Fix signature mismatch của `useLeave.ts` ↔ `leaveService.ts` (approveLeaveRequest và rejectLeaveRequest)
- [ ] **[FE] Task 1.4** — Dashboard: thay `useWeekSessions` (admin hook) bằng `useTeacherSchedule` để hiển thị lịch hôm nay đúng teacher
- [ ] **[FE] Task 1.5** — Wrap tất cả `authService.getCurrentTeacherId()` trong `try/catch` hoặc dùng `useAuth()` hook để tránh crash

### 🟡 Priority 2 — Documents Module (Quan trọng, cần ưu tiên)

- [ ] **[FE] Task 2.1** — Tạo `documentService.ts` với các hàm: `getDocuments(classId?)`, `uploadDocument(file, meta)`, `deleteDocument(id)`
- [ ] **[FE] Task 2.2** — Tạo `useDocuments` hook (React Query) cho list + invalidation
- [ ] **[FE] Task 2.3** — Cập nhật `TeacherDocumentsPage`: xóa `mockDocuments`, dùng hook thực, kết nối `useClasses` để lấy danh sách lớp thật
- [ ] **[FE] Task 2.4** — Implement upload thực sự: gọi `POST /documents` với `multipart/form-data`

### 🟡 Priority 3 — Missing Backend Endpoints

- [ ] **[BE] Task 3.1** — Thêm `GET /api/v1/leave/stats` vào `LeaveController` + `LeaveService`
- [ ] **[BE] Task 3.2** — Thêm `GET /api/v1/teachers/me/pending-tasks` cho Dashboard (danh sách việc cần làm của teacher đang đăng nhập)
- [ ] **[BE] Task 3.3** — Thêm `GET /api/v1/exams/{id}/statistics` — tổng hợp thống kê bài thi
- [ ] **[BE] Task 3.4** — Xem xét thêm `PATCH /api/v1/exams/{id}/archive` hoặc đổi FE dùng `DELETE`

### 🟢 Priority 4 — Cải thiện & Refactor

- [ ] **[FE] Task 4.1** — Dashboard: tích hợp API `GET /teachers/me/pending-tasks` thay thế mock sau khi BE làm xong Task 3.2
- [ ] **[FE] Task 4.2** — Reschedule: cân nhắc thêm endpoint `/reschedule/teacher/me` (tương tự schedule) thay vì truyền teacherId từ FE
- [ ] **[FE] Task 4.3** — Grades module: rà soát `gradeService.ts` để xác nhận endpoint đúng
- [ ] **[FE] Task 4.4** — Exam module: xóa các service call đến endpoint không tồn tại, hoặc hiện UI graceful khi 404

---

## 5. ✅ Đã hoàn thành trong phiên làm việc này

| Task | Trạng thái |
|------|-----------|
| Fix bug lịch dạy hiển thị lẫn lộn giữa các teacher | ✅ Hoàn thành |
| Thêm `GET /schedule/teacher/me` endpoint (Backend) | ✅ Hoàn thành |
| Bỏ hardcode `CURRENT_TEACHER_ID` khỏi Schedule & Classes page | ✅ Hoàn thành |
| Fix `getSessionStatus` dùng `apiStatus` thay vì random mock | ✅ Hoàn thành |
| Classes page: để Backend tự resolve teacher từ JWT | ✅ Hoàn thành |
