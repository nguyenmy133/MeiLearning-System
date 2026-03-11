# 📊 MeiLearning System — Entity Relationship Diagram (ERD)

> **Version**: 1.0
> **Ngày tạo**: 11/03/2026
> **Database**: MySQL 8.x
> **Milestone**: M1 — Database Design & Core Entities

---

## 🗺️ ERD Diagram

```mermaid
erDiagram
    users ||--o| teachers : "1:1 (role=teacher)"
    users ||--o| students : "1:1 (role=student)"
    
    subjects ||--o{ classes : "1:N"
    teachers ||--o{ classes : "1:N (chủ nhiệm)"
    rooms ||--o{ classes : "1:N"
    facilities ||--o{ rooms : "1:N"
    
    teachers }o--o{ subjects : "M:N (teacher_subjects)"
    students }o--o{ classes : "M:N (class_enrollments)"
    
    classes ||--o{ class_sessions : "1:N"
    class_sessions ||--o{ attendance_records : "1:N"
    students ||--o{ attendance_records : "1:N"
    
    students ||--o{ tuition_invoices : "1:N"
    classes ||--o{ tuition_invoices : "1:N"
    
    classes ||--o{ exams : "1:N"
    exams ||--o{ exam_results : "1:N"
    students ||--o{ exam_results : "1:N"
    
    students ||--o{ grades : "1:N"
    classes ||--o{ grades : "1:N"
    
    users ||--o{ leave_requests : "1:N (requester)"
    users ||--o{ leave_requests : "1:N (reviewer)"
    class_sessions ||--o{ leave_requests : "1:N"
    
    teachers ||--o{ reschedule_requests : "1:N"
    class_sessions ||--o{ reschedule_requests : "1:N"
    
    users ||--o{ notifications : "1:N"

    users {
        bigint id PK
        varchar name
        varchar username UK
        varchar email UK
        varchar password
        varchar phone
        varchar avatar
        enum role "admin/teacher/student"
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    subjects {
        bigint id PK
        varchar name
        varchar code UK
        text description
        varchar category
        bigint base_price_per_session
        enum status "active/inactive"
        timestamp created_at
        timestamp updated_at
    }

    facilities {
        bigint id PK
        varchar name
        varchar address
        varchar phone
        varchar manager
        enum status "active/maintenance/inactive"
        timestamp created_at
        timestamp updated_at
    }

    rooms {
        bigint id PK
        varchar name
        bigint facility_id FK
        int capacity
        enum status "available/occupied/maintenance"
        timestamp created_at
        timestamp updated_at
    }

    teachers {
        bigint id PK
        bigint user_id FK_UK
        date date_of_birth
        enum gender "male/female/other"
        varchar address
        text bio
        date join_date
        enum status "active/inactive/locked"
        timestamp created_at
        timestamp updated_at
    }

    teacher_subjects {
        bigint teacher_id FK
        bigint subject_id FK
    }

    students {
        bigint id PK
        bigint user_id FK_UK
        varchar parent_phone
        date date_of_birth
        enum gender "male/female/other"
        varchar grade "Lớp trường: 10, 11, 12"
        varchar address
        enum status "active/inactive"
        enum tuition_status "paid/pending/overdue"
        date enroll_date
        date drop_date
        varchar drop_reason
        text drop_notes
        timestamp created_at
        timestamp updated_at
    }

    classes {
        bigint id PK
        varchar name
        bigint subject_id FK
        bigint teacher_id FK
        bigint room_id FK
        int max_students
        bigint price_per_session
        json schedule "SessionSlot[]"
        date start_date
        date end_date
        text description
        enum status "upcoming/active/completed"
        timestamp created_at
        timestamp updated_at
    }

    class_enrollments {
        bigint id PK
        bigint student_id FK
        bigint class_id FK
        date enrolled_at
        timestamp created_at
        timestamp updated_at
    }

    class_sessions {
        bigint id PK
        bigint class_id FK
        date date
        time start_time
        time end_time
        enum status "upcoming/completed/cancelled"
        enum type "regular/makeup/extra"
        text notes
        timestamp created_at
        timestamp updated_at
    }

    attendance_records {
        bigint id PK
        bigint session_id FK
        bigint student_id FK
        enum status "present/absent/late"
        time check_in_time
        enum method "qr/manual"
        text note
        timestamp created_at
        timestamp updated_at
    }

    tuition_invoices {
        bigint id PK
        bigint student_id FK
        bigint class_id FK
        varchar month "MM/YYYY"
        bigint total_amount
        bigint discount_amount
        varchar discount_reason
        date due_date
        enum status "pending/reviewing/paid/overdue"
        date paid_date
        varchar payment_method
        varchar payment_proof_url
        int billable_sessions
        bigint price_per_session
        timestamp created_at
        timestamp updated_at
    }

    exams {
        bigint id PK
        bigint teacher_id FK
        varchar title
        varchar subject
        int duration "minutes"
        int total_questions
        timestamp start_time
        timestamp end_time
        enum status "draft/published/ongoing/ended/archived"
        timestamp created_at
        timestamp updated_at
    }

    exam_classes {
        bigint exam_id FK
        bigint class_id FK
    }

    exam_results {
        bigint id PK
        bigint exam_id FK
        bigint student_id FK
        decimal score "0-100"
        int correct_answers
        int time_spent "minutes"
        boolean passed
        timestamp submitted_at
        timestamp created_at
        timestamp updated_at
    }

    grades {
        bigint id PK
        bigint student_id FK
        bigint class_id FK
        decimal avg_score "0-10"
        enum trend "up/down/stable"
        int attendance_rate "0-100"
        text comment
        timestamp comment_updated_at
        timestamp created_at
        timestamp updated_at
    }

    leave_requests {
        bigint id PK
        bigint requester_id FK "User ID (student or teacher)"
        bigint session_id FK
        enum requester_type "student/teacher"
        enum type "leave/late"
        varchar reason
        enum status "pending/approved/rejected"
        bigint reviewed_by_id FK
        timestamp reviewed_at
        varchar reject_reason
        timestamp created_at
        timestamp updated_at
    }

    reschedule_requests {
        bigint id PK
        bigint teacher_id FK
        bigint class_id FK
        bigint session_id FK
        enum type "reschedule/cancel"
        date original_date
        varchar original_time
        date requested_date
        varchar requested_time
        varchar reason
        enum status "pending/approved/rejected"
        varchar reviewed_by
        timestamp reviewed_at
        varchar reject_reason
        timestamp created_at
        timestamp updated_at
    }

    notifications {
        bigint id PK
        bigint user_id FK
        varchar type "announcement/payment/schedule/document"
        varchar title
        text content
        boolean is_read
        timestamp created_at
        timestamp updated_at
    }
```

---

## 📋 Chi tiết từng bảng

### 1. `users` — Người dùng hệ thống (✅ Đã có)

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(255) | NOT NULL | Họ tên |
| `username` | VARCHAR(100) | NOT NULL, UNIQUE | Tên đăng nhập |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hashed |
| `phone` | VARCHAR(20) | | Số điện thoại |
| `avatar` | VARCHAR(500) | | URL ảnh đại diện |
| `role` | ENUM('admin','teacher','student') | NOT NULL | Vai trò |
| `active` | BOOLEAN | DEFAULT TRUE | Trạng thái tài khoản |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

---

### 2. `subjects` — Môn học

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(100) | NOT NULL | Tên môn học |
| `code` | VARCHAR(20) | NOT NULL, UNIQUE | Mã môn (VD: MATH, ENG) |
| `description` | TEXT | | Mô tả |
| `category` | VARCHAR(50) | NOT NULL | Danh mục (Tự nhiên, Xã hội, Ngoại ngữ, Công nghệ) |
| `base_price_per_session` | BIGINT | NOT NULL, DEFAULT 0 | Giá cơ bản/buổi (VND) |
| `status` | ENUM('active','inactive') | DEFAULT 'active' | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

---

### 3. `facilities` — Cơ sở (chi nhánh)

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(100) | NOT NULL | Tên cơ sở |
| `address` | VARCHAR(500) | NOT NULL | Địa chỉ |
| `phone` | VARCHAR(20) | | SĐT liên hệ |
| `manager` | VARCHAR(100) | | Người quản lý |
| `status` | ENUM('active','maintenance','inactive') | DEFAULT 'active' | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

---

### 4. `rooms` — Phòng học

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(50) | NOT NULL | Tên phòng |
| `facility_id` | BIGINT | FK → facilities(id), NOT NULL | Thuộc cơ sở nào |
| `capacity` | INT | NOT NULL | Sức chứa (1-200) |
| `status` | ENUM('available','occupied','maintenance') | DEFAULT 'available' | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

> **Index**: `idx_rooms_facility` ON (facility_id)

---

### 5. `teachers` — Giáo viên (mở rộng từ User)

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `user_id` | BIGINT | FK → users(id), UNIQUE, NOT NULL | Liên kết tài khoản |
| `date_of_birth` | DATE | | Ngày sinh |
| `gender` | ENUM('male','female','other') | | Giới tính |
| `address` | VARCHAR(500) | | Địa chỉ |
| `bio` | TEXT | | Giới thiệu |
| `join_date` | DATE | | Ngày gia nhập |
| `status` | ENUM('active','inactive','locked') | DEFAULT 'active' | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

---

### 6. `teacher_subjects` — GV dạy môn nào (Join Table)

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `teacher_id` | BIGINT | FK → teachers(id), PK | |
| `subject_id` | BIGINT | FK → subjects(id), PK | |

> **Composite PK**: (teacher_id, subject_id)

---

### 7. `students` — Học viên (mở rộng từ User)

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `user_id` | BIGINT | FK → users(id), UNIQUE, NOT NULL | Liên kết tài khoản |
| `parent_phone` | VARCHAR(20) | | SĐT phụ huynh |
| `date_of_birth` | DATE | | Ngày sinh |
| `gender` | ENUM('male','female','other') | | Giới tính |
| `grade` | VARCHAR(10) | | Lớp trường (10, 11, 12) |
| `address` | VARCHAR(500) | | Địa chỉ |
| `status` | ENUM('active','inactive') | DEFAULT 'active' | |
| `tuition_status` | ENUM('paid','pending','overdue') | DEFAULT 'pending' | |
| `enroll_date` | DATE | | Ngày đăng ký |
| `drop_date` | DATE | | Ngày nghỉ học |
| `drop_reason` | VARCHAR(255) | | Lý do nghỉ |
| `drop_notes` | TEXT | | Ghi chú nghỉ |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

---

### 8. `classes` — Lớp học

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(100) | NOT NULL | Tên lớp |
| `subject_id` | BIGINT | FK → subjects(id), NOT NULL | Môn học |
| `teacher_id` | BIGINT | FK → teachers(id), NOT NULL | Giáo viên phụ trách |
| `room_id` | BIGINT | FK → rooms(id) | Phòng học |
| `max_students` | INT | NOT NULL, DEFAULT 30 | Sĩ số tối đa |
| `price_per_session` | BIGINT | NOT NULL | Giá/buổi |
| `schedule` | JSON | | Lịch học (SessionSlot[]) |
| `start_date` | DATE | NOT NULL | Ngày bắt đầu |
| `end_date` | DATE | | Ngày kết thúc |
| `description` | TEXT | | Mô tả |
| `status` | ENUM('upcoming','active','completed') | DEFAULT 'upcoming' | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

> **Indexes**:
> - `idx_classes_subject` ON (subject_id)
> - `idx_classes_teacher` ON (teacher_id)
> - `idx_classes_room` ON (room_id)
> - `idx_classes_status` ON (status)

---

### 9. `class_enrollments` — Đăng ký lớp (Student ↔ Class)

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `student_id` | BIGINT | FK → students(id), NOT NULL | |
| `class_id` | BIGINT | FK → classes(id), NOT NULL | |
| `enrolled_at` | DATE | | Ngày đăng ký |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

> **Unique**: (student_id, class_id) — mỗi học viên đăng ký 1 lớp 1 lần

---

### 10. `class_sessions` — Buổi học cụ thể

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `class_id` | BIGINT | FK → classes(id), NOT NULL | Thuộc lớp nào |
| `date` | DATE | NOT NULL | Ngày học |
| `start_time` | TIME | NOT NULL | Giờ bắt đầu |
| `end_time` | TIME | NOT NULL | Giờ kết thúc |
| `status` | ENUM('upcoming','completed','cancelled') | DEFAULT 'upcoming' | |
| `type` | ENUM('regular','makeup','extra') | DEFAULT 'regular' | |
| `notes` | TEXT | | Ghi chú |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

> **Indexes**:
> - `idx_sessions_class` ON (class_id)
> - `idx_sessions_date` ON (date)
> - `idx_sessions_class_date` ON (class_id, date)

---

### 11. `attendance_records` — Điểm danh

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `session_id` | BIGINT | FK → class_sessions(id), NOT NULL | Buổi học |
| `student_id` | BIGINT | FK → students(id), NOT NULL | Học viên |
| `status` | ENUM('present','absent','late') | NOT NULL | Trạng thái |
| `check_in_time` | TIME | | Giờ check-in (null nếu absent) |
| `method` | ENUM('qr','manual') | | Phương thức (null nếu absent) |
| `note` | TEXT | | Ghi chú |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

> **Unique**: (session_id, student_id) — mỗi student chỉ điểm danh 1 lần/buổi

---

### 12. `tuition_invoices` — Hóa đơn học phí

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `student_id` | BIGINT | FK → students(id), NOT NULL | Học viên |
| `class_id` | BIGINT | FK → classes(id), NOT NULL | Lớp học |
| `month` | VARCHAR(7) | NOT NULL | Tháng (MM/YYYY) |
| `billable_sessions` | INT | DEFAULT 0 | Số buổi tính phí |
| `price_per_session` | BIGINT | NOT NULL | Đơn giá/buổi tại thời điểm |
| `total_amount` | BIGINT | NOT NULL | Tổng tiền |
| `discount_amount` | BIGINT | DEFAULT 0 | Giảm giá |
| `discount_reason` | VARCHAR(255) | | Lý do giảm |
| `due_date` | DATE | NOT NULL | Hạn đóng |
| `status` | ENUM('pending','reviewing','paid','overdue') | DEFAULT 'pending' | |
| `paid_date` | DATE | | Ngày đóng |
| `payment_method` | VARCHAR(50) | | Phương thức thanh toán |
| `payment_proof_url` | VARCHAR(500) | | Ảnh chuyển khoản |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

> **Indexes**:
> - `idx_tuition_student` ON (student_id)
> - `idx_tuition_month` ON (month)
> - `idx_tuition_status` ON (status)

---

### 13. `exams` — Bài kiểm tra

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `teacher_id` | BIGINT | FK → teachers(id), NOT NULL | GV tạo đề |
| `title` | VARCHAR(255) | NOT NULL | Tiêu đề |
| `subject` | VARCHAR(100) | NOT NULL | Môn |
| `duration` | INT | NOT NULL | Thời gian (phút) |
| `total_questions` | INT | DEFAULT 0 | Tổng câu hỏi |
| `start_time` | TIMESTAMP | | Thời gian bắt đầu |
| `end_time` | TIMESTAMP | | Thời gian kết thúc |
| `status` | ENUM('draft','published','ongoing','ended','archived') | DEFAULT 'draft' | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

---

### 14. `exam_classes` — Exam áp dụng cho lớp nào (Join Table)

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `exam_id` | BIGINT | FK → exams(id), PK | |
| `class_id` | BIGINT | FK → classes(id), PK | |

---

### 15. `exam_results` — Kết quả thi

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `exam_id` | BIGINT | FK → exams(id), NOT NULL | |
| `student_id` | BIGINT | FK → students(id), NOT NULL | |
| `score` | DECIMAL(5,2) | | Điểm (0–100) |
| `correct_answers` | INT | DEFAULT 0 | Số câu đúng |
| `time_spent` | INT | | Thời gian làm bài (phút) |
| `passed` | BOOLEAN | DEFAULT FALSE | Đạt/không đạt |
| `submitted_at` | TIMESTAMP | | Thời điểm nộp bài |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

> **Unique**: (exam_id, student_id)

---

### 16. `grades` — Điểm tổng kết

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `student_id` | BIGINT | FK → students(id), NOT NULL | |
| `class_id` | BIGINT | FK → classes(id), NOT NULL | |
| `avg_score` | DECIMAL(4,2) | DEFAULT 0 | Điểm TB (0–10) |
| `trend` | ENUM('up','down','stable') | DEFAULT 'stable' | Xu hướng |
| `attendance_rate` | INT | DEFAULT 0 | Tỷ lệ có mặt (0–100) |
| `comment` | TEXT | | Nhận xét |
| `comment_updated_at` | TIMESTAMP | | Lần cập nhật nhận xét |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

> **Unique**: (student_id, class_id)

---

### 17. `leave_requests` — Xin nghỉ phép

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `requester_id` | BIGINT | FK → users(id), NOT NULL | Người xin |
| `session_id` | BIGINT | FK → class_sessions(id) | Buổi xin nghỉ |
| `requester_type` | ENUM('student','teacher') | NOT NULL | Loại người xin |
| `type` | ENUM('leave','late') | NOT NULL | Loại yêu cầu |
| `reason` | VARCHAR(500) | NOT NULL | Lý do |
| `status` | ENUM('pending','approved','rejected') | DEFAULT 'pending' | |
| `reviewed_by_id` | BIGINT | FK → users(id) | Người duyệt |
| `reviewed_at` | TIMESTAMP | | Thời điểm duyệt |
| `reject_reason` | VARCHAR(500) | | Lý do từ chối |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

---

### 18. `reschedule_requests` — Xin dời lịch

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `teacher_id` | BIGINT | FK → teachers(id), NOT NULL | GV yêu cầu |
| `class_id` | BIGINT | FK → classes(id), NOT NULL | Lớp học |
| `session_id` | BIGINT | FK → class_sessions(id) | Buổi cụ thể |
| `type` | ENUM('reschedule','cancel') | NOT NULL | Loại yêu cầu |
| `original_date` | DATE | NOT NULL | Ngày gốc |
| `original_time` | VARCHAR(20) | | Giờ gốc |
| `requested_date` | DATE | | Ngày mới |
| `requested_time` | VARCHAR(20) | | Giờ mới |
| `reason` | VARCHAR(500) | NOT NULL | Lý do |
| `status` | ENUM('pending','approved','rejected') | DEFAULT 'pending' | |
| `reviewed_by` | VARCHAR(100) | | Tên admin duyệt |
| `reviewed_at` | TIMESTAMP | | Thời điểm duyệt |
| `reject_reason` | VARCHAR(500) | | Lý do từ chối |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

---

### 19. `notifications` — Thông báo

| Column | Type | Constraints | Mô tả |
|--------|------|------------|--------|
| `id` | BIGINT | PK, AUTO_INCREMENT | |
| `user_id` | BIGINT | FK → users(id), NOT NULL | Người nhận |
| `type` | VARCHAR(50) | NOT NULL | Loại (announcement/payment/schedule/document) |
| `title` | VARCHAR(255) | NOT NULL | Tiêu đề |
| `content` | TEXT | | Nội dung |
| `is_read` | BOOLEAN | DEFAULT FALSE | Đã đọc chưa |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

> **Index**: `idx_notifications_user` ON (user_id, is_read)

---

## 🔗 Tổng quan Quan hệ

| Quan hệ | Loại | Mô tả |
|---------|------|--------|
| User → Teacher | 1:1 | Mỗi teacher có 1 user account |
| User → Student | 1:1 | Mỗi student có 1 user account |
| Facility → Room | 1:N | Mỗi cơ sở có nhiều phòng |
| Subject → Class | 1:N | Mỗi môn có nhiều lớp |
| Teacher → Class | 1:N | Mỗi GV dạy nhiều lớp |
| Room → Class | 1:N | Mỗi phòng có nhiều lớp |
| Teacher ↔ Subject | M:N | GV dạy nhiều môn, mỗi môn nhiều GV |
| Student ↔ Class | M:N | Qua bảng `class_enrollments` |
| Class → ClassSession | 1:N | Mỗi lớp có nhiều buổi |
| ClassSession → Attendance | 1:N | Mỗi buổi điểm danh nhiều SV |
| Student → TuitionInvoice | 1:N | Mỗi SV có nhiều hóa đơn |
| Class → Exam | 1:N (qua M:N) | Qua bảng `exam_classes` |
| Exam → ExamResult | 1:N | Mỗi bài thi nhiều kết quả |
| Student + Class → Grade | N:1 | Điểm tổng kết theo lớp |
| User → LeaveRequest | 1:N | Người xin nghỉ |
| Teacher → RescheduleRequest | 1:N | GV xin dời lịch |
| User → Notification | 1:N | Người nhận thông báo |

---

## 📐 Design Decisions

> [!NOTE]
> **Tại sao Teacher/Student tách khỏi User?**
> - User chỉ chứa thông tin đăng nhập (authentication)
> - Teacher/Student chứa thông tin nghiệp vụ riêng (profile data)
> - Cho phép mở rộng thêm role mà không ảnh hưởng User table
> - Quan hệ 1:1 qua `user_id` (UNIQUE FK)

> [!NOTE]
> **Tại sao `schedule` dùng JSON column?**
> - SessionSlot[] không cần query riêng lẻ
> - Luôn đọc/ghi toàn bộ schedule cùng lúc với Class
> - Giảm join complexity
> - MySQL 8+ hỗ trợ JSON functions tốt

> [!IMPORTANT]
> **`price_per_session` lưu ở cả Class và TuitionInvoice:**
> - Class: giá hiện tại
> - TuitionInvoice: giá tại thời điểm tạo hóa đơn (snapshot)
> - Đảm bảo hóa đơn không bị ảnh hưởng khi giá lớp thay đổi
