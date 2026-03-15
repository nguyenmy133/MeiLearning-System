# PROMPT: RÀ SOÁT TOÀN BỘ HỆ THỐNG MEILEARNING

> **Mục đích**: Dùng prompt này để yêu cầu AI rà soát từng module theo từng role, kiểm tra hoạt động và sự liên thông giữa các role.

---

## CONTEXT

Đây là hệ thống quản lý trung tâm giáo dục **MeiLearning System**, gồm:

- **Backend**: Spring Boot + Java 17, REST API, JWT Authentication, Spring Security với `@PreAuthorize`
- **Frontend**: React + TypeScript + Vite
- **Database**: MySQL/PostgreSQL qua Spring Data JPA

### 3 Roles chính
| Role | Mô tả |
|------|--------|
| **admin** | Quản lý toàn bộ hệ thống: lớp, giáo viên, học viên, học phí, phòng, cơ sở, môn học, báo cáo, QR settings |
| **teacher** | Quản lý lớp mình dạy, điểm danh, chấm điểm, lịch dạy, tài liệu, xin nghỉ/dời lịch |
| **student** | Xem lớp, lịch học, điểm, điểm danh QR, tài liệu, xin nghỉ, thông báo |

### Cấu trúc Backend

**Controllers & Quyền truy cập:**

| Controller | `@PreAuthorize` | Modules |
|------------|-----------------|---------|
| `AuthController` | public | Login, Change Password |
| `ProfileController` | `isAuthenticated()` | Xem/sửa profile |
| `NotificationController` | `isAuthenticated()` | Xem thông báo |
| `ClassController` | `admin, teacher` | CRUD Lớp học |
| `AttendanceController` | `admin, teacher, student` | Điểm danh, QR check-in |
| `ScheduleController` | `admin, teacher, student` | Lịch dạy/học |
| `GradeController` | `admin, teacher, student` | Điểm, nhận xét |
| `ExamController` | `admin, teacher, student` | Bài kiểm tra |
| `DocumentController` | `admin, teacher, student` (upload: `admin, teacher`) | Tài liệu |
| `LeaveController` | `admin, teacher, student` | Xin nghỉ |
| `RescheduleController` | `admin, teacher` | Dời lịch |
| `StudentController` | `admin` | CRUD Học viên |
| `TeacherController` | `admin` | CRUD Giáo viên |
| `SubjectController` | `admin` | CRUD Môn học |
| `RoomController` | `admin` | CRUD Phòng học |
| `FacilityController` | `admin` | CRUD Cơ sở |
| `TuitionController` | `admin` | Học phí, hóa đơn |
| `ReportsController` | `admin` | Báo cáo tổng hợp |
| `QrSettingsController` | `admin` | Cấu hình QR |

**Service Implementations:** 22 services trong `service/impl/`

**Entities:** User, Student, Teacher, ClassEntity, ClassSession, ClassEnrollment, AttendanceRecord, Grade, Exam, ExamResult, TuitionInvoice, Document, LeaveRequest, RescheduleRequest, Notification, Room, Facility, Subject, QrSettings

**Frontend Features:**
- `features/admin/` – Dashboard admin
- `features/teacher/` – Dashboard giáo viên
- `features/user/` – (Student) Dashboard học viên
- `features/auth/` – Login/Logout
- `features/shared/` – Components dùng chung
- `features/landing/` – Trang landing

---

## PROMPT

```
Bạn là Senior Full-Stack Developer. Hãy rà soát TOÀN BỘ hệ thống MeiLearning System theo yêu cầu sau.

## YÊU CẦU RÀ SOÁT

### 1. RÀ SOÁT THEO TỪNG ROLE

Với MỖI role (admin, teacher, student), hãy kiểm tra TẤT CẢ các module mà role đó có quyền truy cập:

#### A. ROLE: ADMIN
Rà soát từng module:
- [ ] **Auth**: Login, Change Password
- [ ] **Dashboard**: Thống kê tổng quan (số lớp, học viên, giáo viên, doanh thu)
- [ ] **Quản lý Lớp học**: Tạo/sửa/xóa lớp, kết thúc lớp, phân công giáo viên, gán phòng, lịch học
- [ ] **Quản lý Học viên**: Tạo/sửa/xóa học viên, ghi danh vào lớp, rút khỏi lớp, lọc/tìm kiếm
- [ ] **Quản lý Giáo viên**: Tạo/sửa/xóa giáo viên, xem lịch dạy, lọc/tìm kiếm
- [ ] **Quản lý Môn học**: Tạo/sửa/xóa môn, liên kết với lớp
- [ ] **Quản lý Phòng/Cơ sở**: CRUD phòng, CRUD cơ sở, trạng thái phòng
- [ ] **Điểm danh**: Xem danh sách điểm danh, điểm danh hàng loạt, thống kê
- [ ] **Lịch & Schedule**: Xem lịch tất cả lớp, auto-generate sessions
- [ ] **Học phí**: Tạo hóa đơn, tạo hàng loạt, xác nhận thanh toán, từ chối, thống kê
- [ ] **Bài kiểm tra**: Tạo/sửa bài kiểm tra, nhập điểm
- [ ] **Chấm điểm**: Xem/cập nhật điểm, nhận xét
- [ ] **Tài liệu**: Upload/xóa tài liệu cho lớp
- [ ] **Xin nghỉ**: Xem/duyệt/từ chối đơn xin nghỉ
- [ ] **Dời lịch**: Tạo/duyệt yêu cầu dời lịch
- [ ] **Thông báo**: Gửi/nhận thông báo (In-App + Email + SMS)
- [ ] **Báo cáo**: Xem báo cáo tổng hợp
- [ ] **QR Settings**: Cấu hình thời gian QR check-in
- [ ] **Profile**: Xem/sửa thông tin cá nhân

#### B. ROLE: TEACHER  
Rà soát từng module:
- [ ] **Auth**: Login, Change Password
- [ ] **Dashboard**: Thống kê lớp mình dạy
- [ ] **Lớp học**: Xem danh sách lớp mình dạy, chi tiết lớp
- [ ] **Điểm danh**: Điểm danh cho lớp mình dạy, xem lịch sử
- [ ] **Lịch dạy**: Xem lịch dạy của mình
- [ ] **Bài kiểm tra**: Tạo/sửa bài kiểm tra cho lớp mình
- [ ] **Chấm điểm**: Nhập/cập nhật điểm cho học viên
- [ ] **Tài liệu**: Upload tài liệu cho lớp
- [ ] **Xin nghỉ**: Tạo đơn xin nghỉ, xem trạng thái
- [ ] **Dời lịch**: Tạo yêu cầu dời lịch
- [ ] **Thông báo**: Nhận thông báo
- [ ] **Profile**: Xem/sửa thông tin cá nhân

#### C. ROLE: STUDENT
Rà soát từng module:
- [ ] **Auth**: Login, Change Password
- [ ] **Dashboard**: Thống kê cá nhân (lịch học, điểm danh, điểm)
- [ ] **Lớp học**: Xem danh sách lớp đang học
- [ ] **Điểm danh**: QR check-in, xem lịch sử điểm danh
- [ ] **Lịch học**: Xem lịch học cá nhân
- [ ] **Bài kiểm tra**: Xem bài kiểm tra, nộp kết quả
- [ ] **Điểm**: Xem điểm, nhận xét của giáo viên
- [ ] **Tài liệu**: Xem/download tài liệu
- [ ] **Xin nghỉ**: Tạo đơn xin nghỉ, xem trạng thái
- [ ] **Học phí**: Xem hóa đơn, nộp thanh toán
- [ ] **Thông báo**: Nhận thông báo
- [ ] **Profile**: Xem/sửa thông tin cá nhân

### 2. KIỂM TRA LIÊN THÔNG GIỮA CÁC ROLE

Hãy kiểm tra các luồng nghiệp vụ xuyên suốt các role:

- [ ] **Luồng Điểm danh**: Teacher điểm danh → Student nhận thông báo vắng → Admin xem thống kê
- [ ] **Luồng Học phí**: Admin tạo hóa đơn → Student xem & nộp thanh toán → Admin xác nhận/từ chối
- [ ] **Luồng Chấm điểm**: Teacher nhập điểm → Student nhận thông báo & xem điểm → Admin xem báo cáo
- [ ] **Luồng Xin nghỉ**: Student/Teacher tạo đơn → Admin duyệt/từ chối → Người tạo nhận thông báo
- [ ] **Luồng Dời lịch**: Teacher tạo yêu cầu → Admin duyệt → Tất cả học viên lớp đó nhận thông báo
- [ ] **Luồng Bài kiểm tra**: Teacher tạo bài → Student làm bài/nộp → Teacher chấm → Student xem kết quả
- [ ] **Luồng Tài liệu**: Teacher upload → Student xem/download
- [ ] **Luồng Thông báo**: Hành động triggers → Thông báo đúng người nhận (In-App / Email / SMS tùy severity)
- [ ] **Luồng Ghi danh**: Admin ghi danh student vào lớp → Student thấy lớp trong dashboard → Teacher thấy student trong lớp

### 3. VỚI MỖI MODULE, HÃY KIỂM TRA

**Backend:**
- [ ] Controller endpoint tồn tại và mapping đúng (GET/POST/PUT/DELETE)
- [ ] `@PreAuthorize` đúng role
- [ ] Service logic xử lý đúng nghiệp vụ
- [ ] Validation input (null check, business rules)
- [ ] Error handling (ResourceNotFoundException, BusinessException)
- [ ] Entity relationships đúng (OneToMany, ManyToOne, etc.)
- [ ] Repository methods tồn tại và đúng query

**Frontend:**
- [ ] Page/Component tồn tại cho module
- [ ] Service/API call đúng endpoint
- [ ] Hook quản lý state đúng
- [ ] Route guard đúng role
- [ ] UI hiển thị đầy đủ data
- [ ] Form validation phía client
- [ ] Loading/Error states xử lý

### 4. FORMAT BÁO CÁO

Hãy viết báo cáo theo format sau cho MỖI module:

```markdown
## [Tên Module] - [Role]

### Trạng thái: ✅ Hoạt động / ⚠️ Có vấn đề / ❌ Chưa hoạt động / 🔲 Chưa implement

### Backend
- **Controller**: [file] - [trạng thái]
- **Service**: [file] - [trạng thái]  
- **Entity**: [file] - [trạng thái]
- **Vấn đề phát hiện**: (nếu có)

### Frontend
- **Page**: [file] - [trạng thái]
- **Service/API**: [file] - [trạng thái]
- **Vấn đề phát hiện**: (nếu có)

### Đề xuất sửa lỗi
1. ...
2. ...
```

### 5. TỔNG KẾT

Cuối báo cáo, hãy cung cấp:

1. **Bảng tổng quan** trạng thái tất cả modules theo từng role (ma trận Role × Module)
2. **Danh sách Issues** ưu tiên theo mức độ nghiêm trọng (Critical → High → Medium → Low)
3. **Danh sách modules chưa implement** hoặc thiếu
4. **Đề xuất roadmap** sửa lỗi theo thứ tự ưu tiên
```

---

## HƯỚNG DẪN SỬ DỤNG

1. Copy phần **PROMPT** ở trên (trong code block)
2. Đưa cho AI cùng với toàn bộ source code của project
3. Yêu cầu AI xuất kết quả ra file `SYSTEM_REVIEW.md`
4. Nếu AI context quá lớn, có thể chia nhỏ theo từng role hoặc từng nhóm module

> **Lưu ý**: Prompt này dành cho project MeiLearning System với cấu trúc cụ thể đã mô tả. Nếu project có thay đổi, cần cập nhật lại phần Context.
