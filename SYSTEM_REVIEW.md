# 🔍 SYSTEM REVIEW — MeiLearning System

> **Ngày rà soát**: 16/03/2026  
> **Reviewer**: Senior Full-Stack Developer (AI Assistant)  
> **Phiên bản**: Backend Spring Boot + Java 17 | Frontend React + TypeScript + Vite

---

## MỤC LỤC

1. [Rà soát theo Role](#1-rà-soát-theo-role)
   - [A. ADMIN](#a-role-admin)
   - [B. TEACHER](#b-role-teacher)
   - [C. STUDENT](#c-role-student)
2. [Kiểm tra liên thông giữa các Role](#2-kiểm-tra-liên-thông-giữa-các-role)
3. [Bảng tổng quan](#3-bảng-tổng-quan)
4. [Danh sách Issues](#4-danh-sách-issues)
5. [Modules chưa implement / thiếu](#5-modules-chưa-implement--thiếu)
6. [Đề xuất Roadmap sửa lỗi](#6-đề-xuất-roadmap-sửa-lỗi)

---

## 1. RÀ SOÁT THEO ROLE

---

### A. ROLE: ADMIN

---

#### 1.1 Auth (Login, Change Password) — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: `AuthController.java` — ✅ Có 3 endpoints: `POST /login`, `GET /me`, `PUT /change-password`
- **Service**: `AuthServiceImpl.java` — ✅ Login + JWT token generation, change password, get current user
- **Entity**: `User.java` — ✅ Đầy đủ fields: username, email, password, role, active
- **Vấn đề phát hiện**:
  - ⚠️ Endpoint `/api/v1/auth/change-password` được config `permitAll()` trong `SecurityConfig.java` (line 70) nhưng controller lại dùng `Principal principal` → nếu không có JWT thì `principal` = null → **NullPointerException**.
  - ⚠️ **Vietnamese encoding bị lỗi (mojibake)** ở nhiều message trong `AuthServiceImpl.java`: `"máº­t khẩu không Ä'ºng"`, `"ngÆ°á»i d¹ng"` — đây là lỗi double-encoding UTF-8.

### Frontend
- **Page**: `features/auth/LoginPage.tsx` — ✅ Tồn tại
- **Service/API**: `features/shared/auth/authService.ts` — ✅ Đọc user từ localStorage
- **Guards**: `features/shared/auth/guards.tsx` — ✅ `PublicOnlyRoute` + `RoleRoute` 

### Đề xuất sửa lỗi
1. **Critical**: Bỏ `/api/v1/auth/change-password` khỏi `permitAll()` — endpoint này yêu cầu authenticated user.
2. Fix Vietnamese encoding trong tất cả service files (đã có conversation trước nhưng vẫn còn sót).

---

#### 1.2 Dashboard — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: Sử dụng kết hợp `ReportsController` (`/api/v1/reports/overview`) + các stats endpoints riêng
- **Service**: `ReportsServiceImpl.java` — ✅ Aggregate stats từ StudentService, TeacherService, ClassService, TuitionService
- **Entity**: Dùng các entity đã có

### Frontend
- **Page**: `features/admin/dashboard/pages/AdminDashboard.tsx` — ✅ Tồn tại
- **Service/API**: `features/admin/dashboard/services/dashboardService.ts` — ✅ Tồn tại
- **Hooks**: `features/admin/dashboard/hooks/useDashboard.ts` — ✅ Tồn tại

### Đề xuất sửa lỗi
- Không có vấn đề nghiêm trọng.

---

#### 1.3 Quản lý Lớp học — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: `ClassController.java` — ✅ `@PreAuthorize("hasAnyRole('admin', 'teacher')")`. Có CRUD + end class + stats
- **Service**: `ClassServiceImpl.java` — ✅ Full CRUD, Specification-based filtering, pagination
- **Entity**: `ClassEntity.java` (3865B) — ✅ Relationships: Subject, Teacher, Room, Enrollments, Sessions
- **Repository**: `ClassRepository.java` — ✅ Có `countByStatus`, `countTotalStudentsInActiveClasses`

### Frontend
- **Page**: `features/admin/classes/pages/AdminClassesPage.tsx` — ✅
- **Service**: `features/admin/classes/services/classService.ts` — ✅
- **Hooks**: `features/admin/classes/hooks/useClasses.ts` — ✅

### Đề xuất sửa lỗi
- Không có vấn đề nghiêm trọng.

---

#### 1.4 Quản lý Học viên — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: `StudentController.java` — ✅ `@PreAuthorize("hasRole('admin')")`. CRUD + drop + reactivate + reset password + stats
- **Service**: `StudentServiceImpl.java` — ✅ Full CRUD, enrollment management, drop/reactivate
- **Entity**: `Student.java` (3320B) — ✅ Relationships: User, Enrollments, Grades, AttendanceRecords

### Frontend
- **Page**: `features/admin/students/pages/AdminStudentsPage.tsx` — ✅
- **Components**: `features/admin/students/components/ImportStudentsDialog.tsx` — ✅ Import hàng loạt
- **Service**: `features/admin/students/services/studentService.ts` — ✅
- **Hooks**: `features/admin/students/hooks/useStudents.ts` — ✅

### Đề xuất sửa lỗi
- ⚠️ Encoding lỗi trong error messages (line 218, 196): `"Ä'ang active"`, `"Ä'ang hoáº¡t động"`

---

#### 1.5 Quản lý Giáo viên — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: `TeacherController.java` — ✅ `@PreAuthorize("hasRole('admin')")`. CRUD + lock/unlock + reset password + stats
- **Service**: `TeacherServiceImpl.java` (10134B) — ✅ Full implementation
- **Entity**: `Teacher.java` (2803B) — ✅

### Frontend
- **Page**: `features/admin/teachers/pages/AdminTeachersPage.tsx` — ✅
- **Service**: Inferred from directory structure ✅

### Đề xuất sửa lỗi
- Không có vấn đề nghiêm trọng.

---

#### 1.6 Quản lý Môn học — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: `SubjectController.java` — ✅ `@PreAuthorize("hasRole('admin')")`. Full CRUD + stats
- **Service**: `SubjectServiceImpl.java` (6427B) — ✅
- **Entity**: `Subject.java` (2207B) — ✅

### Frontend
- **Page**: `features/admin/subjects/pages/AdminSubjectsPage.tsx` — ✅
- **Service**: `features/admin/subjects/services/` — ✅

### Đề xuất sửa lỗi
- Không có vấn đề nghiêm trọng.

---

#### 1.7 Quản lý Phòng / Cơ sở — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: `RoomController.java` — ✅ `@PreAuthorize("hasRole('admin')")`. Full CRUD
- **Controller**: `FacilityController.java` — ✅ `@PreAuthorize("hasRole('admin')")`. Full CRUD + stats
- **Service**: `RoomServiceImpl.java` (4806B), `FacilityServiceImpl.java` (5505B) — ✅
- **Entity**: `Room.java` (1942B), `Facility.java` (1677B) — ✅

### Frontend
- **Page**: `features/admin/facilities/pages/AdminFacilitiesPage.tsx` — ✅
- **Services**: `facilityService.ts` + `roomService.ts` — ✅
- **Hooks**: `useFacilities.ts` + `useRooms.ts` — ✅

### Đề xuất sửa lỗi
- Không có vấn đề nghiêm trọng.

---

#### 1.8 Điểm danh — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: `AttendanceController.java` — ✅ `@PreAuthorize("hasAnyRole('admin', 'teacher', 'student')")`.
  - `GET /attendance?sessionId=` — danh sách điểm danh
  - `POST /attendance/bulk` — điểm danh hàng loạt
  - `POST /attendance/check-in` — QR check-in 
  - `GET /attendance/stats` — thống kê
- **Service**: `AttendanceServiceImpl.java` (7486B) — ✅ Bulk attendance, QR check-in, stats, notification dispatch
- **Vấn đề**: Không có vấn đề.

### Frontend
- **Page**: `features/admin/attendance/pages/AdminAttendancePage.tsx` — ✅
- **Service**: `features/admin/attendance/services/attendanceService.ts` — ✅
- **Hooks**: `features/admin/attendance/hooks/useAttendance.ts` — ✅

---

#### 1.9 Lịch & Schedule — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: `ScheduleController.java` — ✅ `@PreAuthorize("hasAnyRole('admin', 'teacher', 'student')")`.
  - `GET /schedule` — lịch tổng (admin)
  - `GET /schedule/teacher/{id}` — lịch giáo viên
  - `GET /schedule/student/{id}` — lịch học viên
  - `GET /sessions?classId=` — sessions của 1 lớp
  - `POST /sessions/generate/{classId}` — auto-generate sessions
  - `POST /sessions/generate-all` — generate cho tất cả lớp active
- **Service**: `ScheduleServiceImpl.java` (10351B) — ✅ Đầy đủ logic generate sessions, date range calculations

### Frontend
- **Page**: `features/admin/schedule/pages/AdminSchedulePage.tsx` — ✅

---

#### 1.10 Học phí — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: `TuitionController.java` — ✅ `@PreAuthorize("hasRole('admin')")`. 
  - `GET /tuition`, `GET /tuition/{id}`, `GET /tuition/student/{studentId}`
  - `POST /tuition` — create manual, `POST /tuition/generate` — auto monthly
  - `POST /tuition/{id}/pay` — student pay, `PATCH /tuition/{id}/confirm`, `PATCH /tuition/{id}/reject`
  - `GET /tuition/overdue`, `GET /tuition/stats`
- **Service**: `TuitionServiceImpl.java` (14617B) — ✅ Full payment lifecycle
- **Vấn đề phát hiện**:
  - ⚠️ **Security issue**: `POST /tuition/{id}/pay` (student action) bị restrict bởi `@PreAuthorize("hasRole('admin')")` ở class-level → **Student không thể gọi endpoint này!** Cần thêm `@PreAuthorize("hasAnyRole('admin','student')")` ở method-level cho `pay`.
  - ⚠️ Tương tự `GET /tuition/student/{studentId}` cũng chỉ admin mới truy cập được.

### Frontend  
- **Page (Admin)**: `features/admin/tuition/pages/AdminTuitionPage.tsx` (568 lines) — ✅ Rất đầy đủ: stats, table, filters, approve, cash confirm, QR modal, generate
- **Page (Student)**: `features/user/tuition/pages/TuitionPage.tsx` — ✅ Tồn tại

### Đề xuất sửa lỗi
1. **Critical**: Override `@PreAuthorize` cho `POST /tuition/{id}/pay` và `GET /tuition/student/{studentId}` để student có thể truy cập.

---

#### 1.11 Bài kiểm tra — ADMIN

### Trạng thái: ⚠️ Có vấn đề

### Backend
- **Controller**: `ExamController.java` — ✅ `@PreAuthorize("hasAnyRole('admin', 'teacher', 'student')")`. Full CRUD + submit + results
- **Service**: `ExamServiceImpl.java` (6125B) — ✅

### Frontend
- **Page**: 🔲 **Không có trang Exam riêng trong admin routes!**
  - Admin routes không có `/admin/exams` — admin không thể xem/quản lý bài kiểm tra
  - Tuy nhiên backend cho phép admin truy cập

### Đề xuất sửa lỗi
1. Thêm trang quản lý Exam cho Admin (hoặc xác nhận admin chỉ view qua teacher).

---

#### 1.12 Chấm điểm — ADMIN

### Trạng thái: ⚠️ Có vấn đề

### Backend
- **Controller**: `GradeController.java` — ✅ `@PreAuthorize("hasAnyRole('admin', 'teacher', 'student')")`. Get by class/student, update
- **Service**: `GradeServiceImpl.java` (3599B) — ✅ Upsert + notification dispatch

### Frontend
- **Page**: 🔲 **Không có trang Grade riêng trong admin routes!**
  - Không có `/admin/grades` — admin không thể xem/cập nhật điểm từ frontend
  
### Đề xuất sửa lỗi
1. Thêm trang quản lý Grades cho Admin.

---

#### 1.13 Tài liệu — ADMIN

### Trạng thái: ⚠️ Có vấn đề

### Backend
- **Controller**: `DocumentController.java` — ✅ Class-level `@PreAuthorize("hasAnyRole('admin', 'teacher', 'student')")`, upload/delete restricted to `admin, teacher`
- **Service**: `DocumentServiceImpl.java` (4043B) — ✅

### Frontend
- **Page**: 🔲 **Không có trang Document riêng trong admin routes!**
  - Không có `/admin/documents`

### Đề xuất sửa lỗi
1. Thêm trang quản lý Documents cho Admin.

---

#### 1.14 Xin nghỉ — ADMIN

### Trạng thái: ⚠️ Có vấn đề

### Backend
- **Controller**: `LeaveController.java` — ✅ `@PreAuthorize("hasAnyRole('admin', 'teacher', 'student')")`. Create, getAll, getByRequester, approve, reject
- **Service**: `LeaveServiceImpl.java` (4445B) — ✅
- **Vấn đề**: 
  - ⚠️ `approve` và `reject` endpoints không có method-level `@PreAuthorize` riêng → student/teacher cũng có thể approve/reject (lỗ hổng bảo mật). Chỉ admin mới nên duyệt/từ chối.

### Frontend
- **Page**: 🔲 **Không có trang Leave Approval riêng trong admin routes!**
  - Không có `/admin/leave-approval`
  - Teacher có `TeacherLeaveApprovalPage` nhưng admin thì không

### Đề xuất sửa lỗi
1. **Critical**: Thêm `@PreAuthorize("hasRole('admin')")` cho `approve` và `reject` methods.
2. Thêm trang duyệt Leave cho Admin.

---

#### 1.15 Dời lịch — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: `RescheduleController.java` — ✅ `@PreAuthorize("hasAnyRole('admin', 'teacher')")`. Create, getAll, getByTeacher, approve, reject
- **Service**: `RescheduleServiceImpl.java` (5701B) — ✅ Approve → update session status + notification dispatch
- **Vấn đề**:
  - ⚠️ `approve` và `reject` không giới hạn ở admin-only → teacher cũng tự duyệt được.

### Frontend
- **Page**: `features/admin/reschedule/pages/AdminRescheduleApprovalPage.tsx` — ✅
- **Route**: `/admin/reschedule-approval` — ✅

### Đề xuất sửa lỗi
1. Thêm `@PreAuthorize("hasRole('admin')")` cho approve/reject reschedule methods.

---

#### 1.16 Thông báo — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: `NotificationController.java` — ✅ `@PreAuthorize("isAuthenticated()")`. Get all, mark read, mark all read
- **Service**: `NotificationServiceImpl.java` (2941B) + `NotificationDispatcher.java` (6642B) — ✅ 3-tier dispatch (In-App / Email / SMS)
- **EmailService**: `SmtpEmailServiceImpl.java` — ✅
- **SmsService**: `SpeedSmsServiceImpl.java` — ✅

### Frontend
- **Page**: `features/admin/notifications/pages/AdminNotificationsPage.tsx` — ✅
- **Route**: `/admin/notifications` — ✅

### Vấn đề phát hiện
- ⚠️ Không có endpoint để admin **tạo/gửi** thông báo chủ động. Controller chỉ có get + mark read. Thông báo hiện chỉ được tạo tự động qua business events.

### Đề xuất sửa lỗi
1. Thêm endpoint `POST /api/v1/notifications/send` cho admin gửi thông báo chủ động.

---

#### 1.17 Báo cáo — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: `ReportsController.java` — ✅ `@PreAuthorize("hasRole('admin')")`. Overview + attendance report + tuition report
- **Service**: `ReportsServiceImpl.java` (1811B) — ✅ Aggregate từ các services khác

### Frontend
- **Page**: `features/admin/reports/pages/AdminReportsPage.tsx` — ✅
- **Service**: `features/admin/reports/services/reportsService.ts` — ✅
- **Hooks**: `features/admin/reports/hooks/useReports.ts` — ✅

---

#### 1.18 QR Settings — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: `QrSettingsController.java` — ✅ `@PreAuthorize("hasRole('admin')")`. GET + PUT
- **Service**: `QrSettingsServiceImpl.java` (1994B) — ✅

### Frontend
- **Page**: `features/admin/qr-settings/pages/QRSettingsPage.tsx` — ✅
- **Route**: `/admin/qr-settings` — ✅

---

#### 1.19 Profile — ADMIN

### Trạng thái: ✅ Hoạt động

### Backend
- **Controller**: `ProfileController.java` — ✅ `@PreAuthorize("isAuthenticated()")`. GET/PUT profile + upload avatar
- **Service**: `ProfileServiceImpl.java` (5122B) — ✅ Role-specific fields (address, DOB, joinDate)
- **Vấn đề**: File upload chỉ lưu path string, không lưu file thực sự (placeholder)

### Frontend
- **Page**: `features/admin/profile/pages/AdminProfilePage.tsx` — ✅
- **Route**: `/admin/profile` — ✅

---

### B. ROLE: TEACHER

---

#### 2.1 Auth — TEACHER

### Trạng thái: ✅ Hoạt động
_(Tương tự Admin — dùng chung AuthController)_

---

#### 2.2 Dashboard — TEACHER

### Trạng thái: ✅ Hoạt động

### Frontend
- **Page**: `features/teacher/dashboard/pages/TeacherDashboard.tsx` — ✅
- **Service**: `features/teacher/dashboard/services/dashboardService.ts` — ✅
- **Hooks**: `features/teacher/dashboard/hooks/useDashboard.ts` — ✅

---

#### 2.3 Lớp học — TEACHER

### Trạng thái: ✅ Hoạt động

### Backend
- Teacher truy cập `ClassController` (shared) — ✅ `@PreAuthorize("hasAnyRole('admin', 'teacher')")`
- ⚠️ Teacher có thể CRUD lớp giống admin (create, update, delete) — có thể nên restrict create/delete chỉ cho admin

### Frontend
- **Page**: `features/teacher/classes/pages/TeacherClassesPage.tsx` — ✅
- **Service**: `features/teacher/classes/services/classService.ts` — ✅
- **Hooks**: `features/teacher/classes/hooks/useTeacherClasses.ts` — ✅

### Đề xuất sửa lỗi
1. Xem xét restrict `POST /classes`, `DELETE /classes/{id}` chỉ cho admin.

---

#### 2.4 Điểm danh — TEACHER

### Trạng thái: ✅ Hoạt động

### Backend
- Teacher truy cập `AttendanceController` — ✅ bulk attendance, QR check-in, stats

### Frontend
- **Page**: `features/teacher/attendance/pages/TeacherAttendancePage.tsx` — ✅
- **Service**: `features/teacher/attendance/services/attendanceService.ts` — ✅
- **Hooks**: `features/teacher/attendance/hooks/useAttendance.ts` — ✅

---

#### 2.5 Lịch dạy — TEACHER

### Trạng thái: ✅ Hoạt động

### Backend
- Teacher truy cập `ScheduleController.getTeacherSchedule(teacherId)` — ✅

### Frontend
- **Page**: `features/teacher/schedule/pages/TeacherSchedulePage.tsx` — ✅

---

#### 2.6 Bài kiểm tra — TEACHER

### Trạng thái: ✅ Hoạt động

### Backend
- Teacher truy cập `ExamController` — ✅ create, publish, delete, get results, get student result

### Frontend
- **Page**: Multiple pages — ✅
  - `TeacherExamManagement.tsx` — danh sách bài kiểm tra
  - `CreateExamPage.tsx` — tạo/sửa
  - `TeacherExamResults.tsx` — kết quả
  - `TeacherStudentExamResult.tsx` — kết quả từng học viên
- **Routes**: 5 routes (exams, exams/create, exams/edit/:id, exams/results/:examId, exams/results/:examId/student/:studentId) — ✅
- **Service**: `features/teacher/exam/services/examService.ts` — ✅

---

#### 2.7 Chấm điểm — TEACHER

### Trạng thái: ✅ Hoạt động

### Backend
- Teacher truy cập `GradeController` — ✅ get by class, get by student, update grade

### Frontend
- **Page**: `features/teacher/grade/pages/TeacherGradesPage.tsx` — ✅
- **Service**: `features/teacher/grade/services/gradeService.ts` — ✅

---

#### 2.8 Tài liệu — TEACHER

### Trạng thái: ✅ Hoạt động

### Backend
- Teacher truy cập `DocumentController` — ✅ upload (admin+teacher), delete (admin+teacher), get all, get by id

### Frontend
- **Page**: `features/teacher/documents/pages/TeacherDocumentsPage.tsx` — ✅

---

#### 2.9 Xin nghỉ — TEACHER

### Trạng thái: ✅ Hoạt động

### Backend
- Teacher truy cập `LeaveController` — ✅ create, getAll, getByRequester

### Frontend
- **Page**: `features/teacher/leave/pages/TeacherLeaveApprovalPage.tsx` — ✅ (tên "Approval" nhưng ở đây teacher tạo đơn)
- **Service**: `features/teacher/leave/services/leaveService.ts` — ✅

---

#### 2.10 Dời lịch — TEACHER

### Trạng thái: ✅ Hoạt động

### Backend
- Teacher truy cập `RescheduleController` — ✅ create, getAll, getByTeacher

### Frontend
- **Page**: `features/teacher/reschedule/pages/TeacherReschedulePage.tsx` — ✅
- **Service**: `features/teacher/reschedule/services/rescheduleService.ts` — ✅

---

#### 2.11 Thông báo — TEACHER

### Trạng thái: ✅ Hoạt động

### Frontend
- **Page**: `features/teacher/notifications/pages/TeacherNotificationsPage.tsx` — ✅

---

#### 2.12 Profile — TEACHER

### Trạng thái: ✅ Hoạt động

### Frontend
- **Page**: `features/teacher/profile/pages/TeacherProfilePage.tsx` — ✅

---

### C. ROLE: STUDENT

---

#### 3.1 Auth — STUDENT

### Trạng thái: ✅ Hoạt động
_(Dùng chung AuthController)_

---

#### 3.2 Dashboard — STUDENT

### Trạng thái: ✅ Hoạt động

### Frontend
- **Page**: `features/user/dashboard/pages/UserDashboard.tsx` — ✅

---

#### 3.3 Lớp học — STUDENT

### Trạng thái: ⚠️ Có vấn đề

### Backend
- Student **KHÔNG** được truy cập `ClassController` — controller `@PreAuthorize("hasAnyRole('admin', 'teacher')")` 
- Không có endpoint riêng để student xem danh sách lớp đang enrolled

### Frontend
- Không có route `/user/classes` riêng — student xem lớp thông qua schedule/dashboard

### Đề xuất sửa lỗi
1. Thêm endpoint cho student xem lớp đang enrolled (hoặc đổi quyền `ClassController.getAll` + `getById` cho student).

---

#### 3.4 Điểm danh — STUDENT

### Trạng thái: ✅ Hoạt động

### Backend
- Student truy cập `AttendanceController` — ✅ QR check-in, get by session

### Frontend
- **Pages**: 
  - `features/user/attendance/pages/CheckInPage.tsx` — ✅ QR Check-in
  - `features/user/attendance/pages/AttendancePage.tsx` — ✅ Lịch sử điểm danh
- **Routes**: `/user/check-in`, `/user/attendance` — ✅

---

#### 3.5 Lịch học — STUDENT

### Trạng thái: ✅ Hoạt động

### Backend
- Student truy cập `ScheduleController.getStudentSchedule(studentId)` — ✅

### Frontend
- **Page**: `features/user/schedule/pages/SchedulePage.tsx` — ✅
- **Route**: `/user/schedule` — ✅

---

#### 3.6 Bài kiểm tra — STUDENT

### Trạng thái: ✅ Hoạt động

### Backend
- Student truy cập `ExamController` — ✅ getAll, getById, submit, getStudentResult

### Frontend
- **Pages**: 
  - `features/user/exam/pages/ExamList.tsx` — ✅ Danh sách bài kiểm tra
  - `features/user/exam/pages/ExamTaking.tsx` — ✅ Làm bài
  - `features/user/exam/pages/ExamResult.tsx` — ✅ Xem kết quả
- **Routes**: `/user/exams`, `/user/exam-taking`, `/user/exam-result` — ✅

---

#### 3.7 Điểm — STUDENT

### Trạng thái: ✅ Hoạt động

### Backend
- Student truy cập `GradeController.getByStudent(studentId)` — ✅

### Frontend
- **Page**: `features/user/grade/pages/UserGradesPage.tsx` — ✅
- **Route**: `/user/grades` — ✅

---

#### 3.8 Tài liệu — STUDENT

### Trạng thái: ✅ Hoạt động

### Backend
- Student truy cập `DocumentController` (class-level allows student) — ✅ getAll, getById

### Frontend
- **Page**: `features/user/documents/pages/DocumentsPage.tsx` — ✅
- **Route**: `/user/documents` — ✅

---

#### 3.9 Xin nghỉ — STUDENT

### Trạng thái: ✅ Hoạt động

### Backend
- Student truy cập `LeaveController` — ✅ create, getByRequester

### Frontend
- **Page**: `features/user/leave/pages/LeavePage.tsx` — ✅
- **Route**: `/user/leave` — ✅

---

#### 3.10 Học phí — STUDENT

### Trạng thái: ❌ Chưa hoạt động đúng

### Backend
- **VẤN ĐỀ CRITICAL**: `TuitionController` class-level `@PreAuthorize("hasRole('admin')")` → Student **KHÔNG THỂ** truy cập bất kỳ tuition endpoint nào:
  - `GET /tuition/student/{studentId}` → 403 Forbidden cho student
  - `POST /tuition/{id}/pay` → 403 Forbidden cho student

### Frontend
- **Page**: `features/user/tuition/pages/TuitionPage.tsx` — ✅ Tồn tại nhưng sẽ KHÔNG LÀM VIỆC vì backend block

### Đề xuất sửa lỗi
1. **CRITICAL**: Override `@PreAuthorize` cho:
   - `GET /tuition/student/{studentId}` → `hasAnyRole('admin', 'student')` 
   - `POST /tuition/{id}/pay` → `hasAnyRole('admin', 'student')`

---

#### 3.11 Thông báo — STUDENT

### Trạng thái: ✅ Hoạt động

### Frontend
- **Page**: `features/user/notifications/pages/NotificationsPage.tsx` — ✅

---

#### 3.12 Profile — STUDENT

### Trạng thái: ✅ Hoạt động

### Frontend
- **Page**: `features/user/profile/pages/ProfilePage.tsx` — ✅

---

## 2. KIỂM TRA LIÊN THÔNG GIỮA CÁC ROLE

---

### 2.1 Luồng Điểm danh

> Teacher điểm danh → Student nhận thông báo vắng → Admin xem thống kê

### Trạng thái: ✅ Hoạt động

| Bước | Mô tả | Backend | Frontend | Status |
|------|--------|---------|----------|--------|
| 1 | Teacher gọi `POST /attendance/bulk` | ✅ `AttendanceServiceImpl.bulkAttendance()` | ✅ TeacherAttendancePage | ✅ |
| 2 | Nếu absent → dispatch notification (HIGH severity: In-App + Email + SMS) | ✅ `notificationDispatcher.notifyUrgent()` | — | ✅ |
| 3 | Student nhận thông báo | ✅ `NotificationController.getAll()` | ✅ NotificationsPage | ✅ |
| 4 | Admin xem thống kê | ✅ `AttendanceController.getStats()`, `ReportsController.getAttendanceReport()` | ✅ AdminAttendancePage, AdminReportsPage | ✅ |

---

### 2.2 Luồng Học phí

> Admin tạo hóa đơn → Student xem & nộp thanh toán → Admin xác nhận/từ chối

### Trạng thái: ❌ Bị gián đoạn

| Bước | Mô tả | Backend | Frontend | Status |
|------|--------|---------|----------|--------|
| 1 | Admin tạo hóa đơn `POST /tuition` hoặc `POST /tuition/generate` | ✅ | ✅ AdminTuitionPage | ✅ |
| 2 | Student xem hóa đơn `GET /tuition/student/{id}` | ❌ **403 Forbidden** (admin-only) | ✅ TuitionPage tồn tại | ❌ |
| 3 | Student nộp thanh toán `POST /tuition/{id}/pay` | ❌ **403 Forbidden** (admin-only) | ✅ TuitionPage | ❌ |
| 4 | Admin xác nhận `PATCH /tuition/{id}/confirm` | ✅ | ✅ AdminTuitionPage | ✅ |
| 5 | Admin từ chối `PATCH /tuition/{id}/reject` | ✅ | ✅ AdminTuitionPage | ✅ |

**Root Cause**: `TuitionController` có `@PreAuthorize("hasRole('admin')")` ở class-level mà không override ở method-level cho student actions.

---

### 2.3 Luồng Chấm điểm

> Teacher nhập điểm → Student nhận thông báo & xem điểm → Admin xem báo cáo

### Trạng thái: ✅ Hoạt động

| Bước | Mô tả | Backend | Frontend | Status |
|------|--------|---------|----------|--------|
| 1 | Teacher nhập/cập nhật điểm `PUT /grades` | ✅ `GradeServiceImpl.update()` | ✅ TeacherGradesPage | ✅ |
| 2 | System gửi notification (MEDIUM: In-App + Email) | ✅ `notificationDispatcher.notifyWithEmail()` | — | ✅ |
| 3 | Student xem điểm `GET /grades/student/{id}` | ✅ | ✅ UserGradesPage | ✅ |
| 4 | Admin xem báo cáo | ✅ ReportsController | ✅ AdminReportsPage | ✅ |

---

### 2.4 Luồng Xin nghỉ

> Student/Teacher tạo đơn → Admin duyệt/từ chối → Người tạo nhận thông báo

### Trạng thái: ⚠️ Có vấn đề

| Bước | Mô tả | Backend | Frontend | Status |
|------|--------|---------|----------|--------|
| 1 | Student/Teacher tạo đơn `POST /leave` | ✅ `LeaveServiceImpl.create()` | ✅ LeavePage, TeacherLeaveApprovalPage | ✅ |
| 2 | Admin duyệt `PATCH /leave/{id}/approve` | ✅ But **no admin-only restriction** | 🔲 **No admin Leave page** | ⚠️ |
| 3 | Admin từ chối `PATCH /leave/{id}/reject` | ✅ But **no admin-only restriction** | 🔲 **No admin Leave page** | ⚠️ |
| 4 | Người tạo nhận thông báo | ❌ **Không gửi notification khi approve/reject** | — | ❌ |

**Issues**:
1. Admin không có trang frontend để duyệt/từ chối leave requests.
2. Approve/reject không gửi notification cho requester.
3. Approve/reject không restrict cho admin-only.

---

### 2.5 Luồng Dời lịch

> Teacher tạo yêu cầu → Admin duyệt → Tất cả học viên lớp đó nhận thông báo

### Trạng thái: ⚠️ Có vấn đề

| Bước | Mô tả | Backend | Frontend | Status |
|------|--------|---------|----------|--------|
| 1 | Teacher tạo yêu cầu `POST /reschedule` | ✅ | ✅ TeacherReschedulePage | ✅ |
| 2 | Admin duyệt `PATCH /reschedule/{id}/approve` | ✅ | ✅ AdminRescheduleApprovalPage | ✅ |
| 3 | **Thông báo cho teacher** khi approved | ✅ `notifyWithEmail()` (MEDIUM) | — | ✅ |
| 4 | **Thông báo cho TẤT CẢ học viên trong lớp** | ❌ **Không implement** — chỉ gửi cho teacher | — | ❌ |

**Issue**: Khi reschedule được duyệt, hệ thống chỉ thông báo cho teacher, KHÔNG thông báo cho tất cả students enrolled trong lớp đó.

---

### 2.6 Luồng Bài kiểm tra

> Teacher tạo bài → Student làm bài/nộp → Teacher chấm → Student xem kết quả

### Trạng thái: ✅ Hoạt động

| Bước | Mô tả | Backend | Frontend | Status |
|------|--------|---------|----------|--------|
| 1 | Teacher tạo bài `POST /exams` | ✅ | ✅ CreateExamPage | ✅ |
| 2 | Teacher publish `PATCH /exams/{id}/publish` | ✅ | ✅ TeacherExamManagement | ✅ |
| 3 | Student xem bài `GET /exams` | ✅ | ✅ ExamList | ✅ |
| 4 | Student nộp bài `POST /exams/{id}/submit` | ✅ | ✅ ExamTaking | ✅ |
| 5 | Teacher xem kết quả `GET /exams/{id}/results` | ✅ | ✅ TeacherExamResults | ✅ |
| 6 | Student xem kết quả `GET /exams/{id}/results/{studentId}` | ✅ | ✅ ExamResult | ✅ |

⚠️ Thiếu notification khi teacher publish exam hoặc khi student nộp bài.

---

### 2.7 Luồng Tài liệu

> Teacher upload → Student xem/download

### Trạng thái: ⚠️ Có vấn đề

| Bước | Mô tả | Backend | Frontend | Status |
|------|--------|---------|----------|--------|
| 1 | Teacher upload `POST /documents` | ✅ | ✅ TeacherDocumentsPage | ✅ |
| 2 | Student xem `GET /documents?classId=` | ✅ | ✅ DocumentsPage | ✅ |
| 3 | Student download | ⚠️ **File không thực sự được lưu** — chỉ là placeholder URL | ✅ UI tồn tại | ⚠️ |

**Issue**: `DocumentServiceImpl.upload()` chỉ tạo path string (`/uploads/documents/...`), không lưu file thực sự xuống disk. Cần integrate với `LocalFileStorageServiceImpl` hoặc S3.

---

### 2.8 Luồng Thông báo

> Hành động triggers → Thông báo đúng người nhận

### Trạng thái: ⚠️ Hoạt động một phần

| Event | Trigger | Severity | In-App | Email | SMS | Status |
|-------|---------|----------|--------|-------|-----|--------|
| Vắng học | `AttendanceServiceImpl.bulkAttendance()` | HIGH | ✅ | ✅ | ✅ | ✅ |
| Cập nhật điểm | `GradeServiceImpl.update()` | MEDIUM | ✅ | ✅ | — | ✅ |
| Reschedule duyệt | `RescheduleServiceImpl.approve()` | MEDIUM | ✅ | ✅ | — | ⚠️ Chỉ cho teacher |
| Leave duyệt/từ chối | `LeaveServiceImpl` | — | ❌ | ❌ | ❌ | ❌ |
| Exam published | `ExamServiceImpl.publish()` | — | ❌ | ❌ | ❌ | ❌ |
| Tuition tạo/overdue | `TuitionServiceImpl` | — | ❌ | ❌ | ❌ | ❌ |
| Student nộp exam | `ExamServiceImpl.submit()` | — | ❌ | ❌ | ❌ | ❌ |

---

### 2.9 Luồng Ghi danh

> Admin ghi danh student vào lớp → Student thấy lớp trong dashboard → Teacher thấy student trong lớp

### Trạng thái: ✅ Hoạt động

| Bước | Mô tả | Backend | Frontend | Status |
|------|--------|---------|----------|--------|
| 1 | Admin tạo student + enroll `POST /students` | ✅ `StudentServiceImpl.create()` với ClassEnrollment | ✅ AdminStudentsPage | ✅ |
| 2 | Student thấy lớp qua schedule | ✅ `ScheduleServiceImpl.getStudentSchedule()` | ✅ SchedulePage | ✅ |
| 3 | Teacher thấy student qua attendance | ✅ `AttendanceServiceImpl.getBySession()` | ✅ TeacherAttendancePage | ✅ |

---

## 3. BẢNG TỔNG QUAN

### Ma trận Role × Module

| Module | Admin | Teacher | Student |
|--------|:-----:|:-------:|:-------:|
| **Auth (Login)** | ✅ | ✅ | ✅ |
| **Auth (Change Password)** | ⚠️ permitAll bug | ⚠️ | ⚠️ |
| **Dashboard** | ✅ | ✅ | ✅ |
| **Quản lý Lớp** | ✅ | ✅ *(có CREATE quyền quá rộng)* | ⚠️ Không có endpoint riêng |
| **Quản lý Học viên** | ✅ | — | — |
| **Quản lý Giáo viên** | ✅ | — | — |
| **Quản lý Môn học** | ✅ | — | — |
| **Quản lý Phòng/Cơ sở** | ✅ | — | — |
| **Điểm danh** | ✅ | ✅ | ✅ |
| **Lịch & Schedule** | ✅ | ✅ | ✅ |
| **Học phí** | ✅ | — | ❌ 403 Forbidden |
| **Bài kiểm tra** | 🔲 Thiếu FE page | ✅ | ✅ |
| **Chấm điểm** | 🔲 Thiếu FE page | ✅ | ✅ |
| **Tài liệu** | 🔲 Thiếu FE page | ✅ | ✅ |
| **Xin nghỉ** | 🔲 Thiếu FE page + security | ✅ | ✅ |
| **Dời lịch** | ✅ | ✅ | — |
| **Thông báo** | ✅ (read-only) | ✅ | ✅ |
| **Báo cáo** | ✅ | — | — |
| **QR Settings** | ✅ | — | — |
| **Profile** | ✅ | ✅ | ✅ |

**Ghi chú**:
- ✅ = Hoạt động đầy đủ
- ⚠️ = Có vấn đề cần xử lý
- ❌ = Không hoạt động
- 🔲 = Chưa implement frontend
- `—` = Không thuộc scope của role này

---

## 4. DANH SÁCH ISSUES

### 🔴 CRITICAL (Phải sửa ngay)

| # | Module | Issue | Impact |
|---|--------|-------|--------|
| C-01 | **Tuition → Student** | `TuitionController` có `@PreAuthorize("hasRole('admin')")` class-level → **Student KHÔNG THỂ xem/nộp học phí** | Luồng thanh toán học phí bị broken hoàn toàn cho student |
| C-02 | **Auth** | `/api/v1/auth/change-password` nằm trong `permitAll()` nhưng method cần `Principal` → **NullPointerException cho unauthenticated users** | Crash khi gọi mà chưa login |
| C-03 | **Leave** | `approve()` + `reject()` không restrict admin-only → **Student/Teacher có thể tự duyệt đơn nghỉ** | Lỗ hổng bảo mật nghiêm trọng |

### 🟠 HIGH (Nên sửa sớm)

| # | Module | Issue | Impact |
|---|--------|-------|--------|
| H-01 | **Reschedule** | `approve()` + `reject()` không restrict admin-only → **Teacher tự duyệt được** | Lỗ hổng bảo mật |
| H-02 | **Leave** | Không gửi notification khi approve/reject leave request | Người dùng không biết đơn đã duyệt/từ chối |
| H-03 | **Reschedule** | Khi duyệt reschedule, chỉ notify teacher, KHÔNG notify students in class | Students không biết lịch thay đổi |
| H-04 | **Document upload** | File không thực sự được lưu — chỉ tạo placeholder path | Upload document bị broken |
| H-05 | **Admin FE** | Thiếu 4 trang admin: Exams, Grades, Documents, Leave Approval | Admin không quản lý được 4 module quan trọng |
| H-06 | **Vietnamese encoding** | Nhiều service files còn mojibake encoding (`máº­t khẩu`, `Ä'ºng`, `ngÆ°á»i d¹ng`, v.v.) | Error messages hiển thị lỗi |

### 🟡 MEDIUM (Nên cải thiện)

| # | Module | Issue | Impact |
|---|--------|-------|--------|
| M-01 | **ClassController** | Teacher có quyền CRUD lớp giống admin (create, delete) | Teacher có thể tạo/xóa lớp ngoài ý muốn |
| M-02 | **Student Classes** | Student không có cách xem danh sách lớp đang enrolled (ClassController restricted) | Thiếu tính năng cho student |
| M-03 | **Notifications** | Thiếu notification cho nhiều events: Tuition created/overdue, Exam published, Exam submitted | Users miss quan trọng info |
| M-04 | **Notifications** | Admin không thể gửi notification chủ động (chỉ auto qua events) | Thiếu tính năng quản trị |
| M-05 | **Profile avatar** | Upload avatar chỉ lưu path, không lưu file thực sự | Avatar không hiển thị |
| M-06 | **ClassController** | Teacher có thể xem TẤT CẢ lớp, không chỉ lớp mình dạy | Có thể thấy data không liên quan |

### 🟢 LOW (Có thể cải thiện)

| # | Module | Issue | Impact |
|---|--------|-------|--------|
| L-01 | **Pagination** | Tuition, Leave, Reschedule, Document, Exam endpoints không có pagination — trả toàn bộ list | Performance issue khi data lớn |
| L-02 | **Audit logging** | Không có audit log cho admin actions (CRUD students, teachers, tuition approve/reject) | Khó trace ai làm gì |
| L-03 | **Input validation** | Một số controller/service thiếu detailed validation (ví dụ: ExamServiceImpl.create không validate classIds exists properly) | Edge case bugs |
| L-04 | **User/Games** | Student có route `/user/games` (2048, Memory Card, Typing Speed) — features bonus, không liên quan core | — |

---

## 5. MODULES CHƯA IMPLEMENT / THIẾU

### Frontend Admin — Thiếu trang

| Module | Backend Ready | Admin FE Page | Priority |
|--------|:------------:|:-------------:|:--------:|
| Exams Management | ✅ `ExamController` | 🔲 Chưa có | HIGH |
| Grades Management | ✅ `GradeController` | 🔲 Chưa có | HIGH |
| Documents Management | ✅ `DocumentController` | 🔲 Chưa có | MEDIUM |
| Leave Approval | ✅ `LeaveController` | 🔲 Chưa có | HIGH |
| Send Notification | ❌ Không có endpoint | 🔲 Chưa có | MEDIUM |

### Backend — Thiếu endpoint/logic

| Feature | Mô tả | Priority |
|---------|--------|:--------:|
| Student-accessible tuition endpoints | Override `@PreAuthorize` cho pay + getByStudent | CRITICAL |
| Student classes endpoint | Endpoint cho student xem lớp enrolled | MEDIUM |
| Notification for Leave approve/reject | Dispatch notification khi leave được xử lý | HIGH |
| Notification for Reschedule → students | Notify tất cả students trong lớp khi reschedule approved | HIGH |
| Notification for Tuition events | Notify student khi có hóa đơn mới/quá hạn | MEDIUM |
| Notification for Exam events | Notify students khi exam published, notify teacher khi student nộp bài | MEDIUM |
| Admin send notification endpoint | `POST /notifications/send` cho admin gửi thủ công | MEDIUM |

---

## 6. ĐỀ XUẤT ROADMAP SỬA LỖI

### Phase 1: Critical Fixes (Tuần 1) ⚡

| # | Task | Effort | Files to modify |
|---|------|--------|-----------------|
| 1 | Fix `@PreAuthorize` cho `TuitionController` — cho phép student truy cập `pay` + `getByStudent` | 30 phút | `TuitionController.java` |
| 2 | Bỏ `/api/v1/auth/change-password` khỏi `permitAll()` trong SecurityConfig | 10 phút | `SecurityConfig.java` |
| 3 | Thêm `@PreAuthorize("hasRole('admin')")` cho `LeaveController.approve()` + `reject()` | 15 phút | `LeaveController.java` |
| 4 | Thêm `@PreAuthorize("hasRole('admin')")` cho `RescheduleController.approve()` + `reject()` | 15 phút | `RescheduleController.java` |

### Phase 2: High Priority (Tuần 2-3) 🔧

| # | Task | Effort |
|---|------|--------|
| 5 | Fix Vietnamese encoding trong tất cả service files (25+ messages) | 2 giờ |
| 6 | Fix DocumentServiceImpl — tích hợp `LocalFileStorageServiceImpl` cho real file storage | 3 giờ |
| 7 | Thêm notification dispatch cho `LeaveServiceImpl.approve()` + `reject()` | 1 giờ |
| 8 | Thêm notification dispatch cho `RescheduleServiceImpl.approve()` — gửi cho tất cả students in class | 2 giờ |
| 9 | Restrict Class CRUD: `POST`, `DELETE /classes/{id}`, `PATCH /{id}/end` chỉ cho admin | 30 phút |

### Phase 3: Admin Pages (Tuần 3-4) 📄

| # | Task | Effort |
|---|------|--------|
| 10 | Tạo `AdminLeaveApprovalPage` + routes + hooks + services | 1 ngày |
| 11 | Tạo `AdminExamsPage` (view exams from all teachers) | 1 ngày |
| 12 | Tạo `AdminGradesPage` (view grades across all classes) | 1 ngày |
| 13 | Tạo `AdminDocumentsPage` (view/manage all documents) | 0.5 ngày |

### Phase 4: Enhancements (Tuần 4-5) ✨

| # | Task | Effort |
|---|------|--------|
| 14 | Thêm endpoint cho Student xem lớp enrolled | 2 giờ |
| 15 | Thêm `POST /notifications/send` endpoint cho admin | 3 giờ |
| 16 | Thêm notification cho Tuition events (tạo, quá hạn) | 2 giờ |
| 17 | Thêm notification cho Exam events (published, submitted) | 2 giờ |
| 18 | Thêm pagination cho Tuition, Leave, Reschedule, Document, Exam APIs | 1 ngày |
| 19 | Thêm data-level filtering: Teacher chỉ xem lớp mình dạy | 3 giờ |
| 20 | Fix Profile avatar — tích hợp file storage | 2 giờ |

---

## TỔNG KẾT

### Đánh giá chung

| Tiêu chí | Đánh giá |
|----------|---------|
| **Kiến trúc** | ✅ Tốt — Clean architecture, tách biệt rõ Controller → Service → Repository |
| **Security** | ⚠️ Có lỗ hổng — 3 issues Critical (Tuition, ChangePassword, Leave) |
| **Frontend** | ⚠️ Admin thiếu 4 trang, nhưng Teacher + Student khá đầy đủ |
| **Notification System** | ⚠️ Framework 3-tier đã có (In-App + Email + SMS) nhưng chỉ integrate 2/8 events |
| **Error Handling** | ✅ Đã có GlobalExceptionHandler, custom exceptions, validation |
| **Vietnamese Encoding** | ❌ Nhiều file bị mojibake — cần fix batch |
| **Code Quality** | ✅ Consistent pattern, dùng Lombok, mapper, DTO |
| **Testing** | 🔲 Không thấy test files — cần bổ sung |

### Phần trăm hoàn thiện theo Role

| Role | Backend | Frontend | Tổng |
|------|:-------:|:--------:|:----:|
| **Admin** | 85% | 75% | **~80%** |
| **Teacher** | 95% | 95% | **~95%** |
| **Student** | 80% | 90% | **~85%** |

> **Ước tính effort để fix tất cả issues**: ~2-3 tuần (1 developer full-time)
