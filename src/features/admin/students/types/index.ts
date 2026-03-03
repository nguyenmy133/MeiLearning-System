/**
 * ============================================================================
 * MODULE HỌC VIÊN - TYPE DEFINITIONS
 * ============================================================================
 *
 * Nghiệp vụ:
 * - Quản lý thông tin học viên (CRUD)
 * - Mỗi học viên đăng ký 1 hoặc nhiều lớp
 * - Có tài khoản hệ thống (username/password)
 * - Admin có thể: reset mật khẩu, ghi nhận nghỉ học (drop), kích hoạt lại
 * - Không xóa vĩnh viễn học viên đang active → phải drop trước
 * - Tạo mới → status mặc định "active", tuitionStatus mặc định "pending"
 * - Drop → status = "inactive", khóa tài khoản ngay
 * - Reactivate → status = "active"
 * ============================================================================
 */

// ==================== ENUMS ====================

export const StudentStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type StudentStatusType =
  (typeof StudentStatus)[keyof typeof StudentStatus];

export const TuitionStatus = {
  PAID: "paid",
  PENDING: "pending",
  OVERDUE: "overdue",
} as const;

export type TuitionStatusType =
  (typeof TuitionStatus)[keyof typeof TuitionStatus];

// ==================== ENTITY ====================

export type Gender = "male" | "female" | "other";

// ==================== CLASS ENROLLMENT ====================

/** Đăng ký lớp (FK-based, BE-ready) */
export interface ClassEnrollment {
  classId: number;    // FK → Class.id
  className: string;  // Tên lớp (denormalized để hiển thị)
}

export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  parentPhone: string;
  avatar: string;
  dateOfBirth: string;     // YYYY-MM-DD
  gender: Gender;
  grade: string;           // Lớp trường (VD: "10", "11", "12")
  address: string;
  classes: ClassEnrollment[];  // Danh sách lớp đang học (FK-based)
  status: StudentStatusType;
  tuitionStatus: TuitionStatusType;
  enrollDate: string;      // YYYY-MM-DD
  dropDate?: string;       // YYYY-MM-DD – chỉ có khi inactive
  dropReason?: string;
  dropNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== DTOs ====================

/** Tạo mới — KHÔNG có status / tuitionStatus (mặc định active / pending) */
export interface CreateStudentDTO {
  name: string;
  email: string;
  phone: string;
  parentPhone: string;
  classes: ClassEnrollment[];
  username: string;
  password: string;
  // Thông tin cá nhân (tùy chọn khi tạo)
  dateOfBirth?: string;
  gender?: Gender;
  grade?: string;
  address?: string;
}

/** Cập nhật thông tin — CÓ tuitionStatus nhưng KHÔNG đổi status trực tiếp
 *  (status đổi qua dropStudent / reactivateStudent) */
export interface UpdateStudentDTO {
  name?: string;
  email?: string;
  phone?: string;
  parentPhone?: string;
  address?: string;
  classes?: ClassEnrollment[];
  tuitionStatus?: TuitionStatusType;
}

/** Ghi nhận nghỉ học */
export interface DropStudentDTO {
  reason: string;
  notes?: string;
  dropDate: string; // YYYY-MM-DD
}

// ==================== QUERY PARAMS ====================

export interface StudentQueryParams {
  search?: string;
  classId?: number;        // Lọc theo ID lớp (ưu tiên)
  className?: string;      // Lọc theo tên lớp (legacy)
  status?: StudentStatusType;
  tuitionStatus?: TuitionStatusType;
  page?: number;
  limit?: number;
}

// ==================== API RESPONSE ====================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  paidTuitionCount: number;  // Đang học + đã đóng phí
  inactiveStudents: number;
}

// ==================== LABEL MAPS ====================

export const STUDENT_STATUS_LABELS: Record<StudentStatusType, string> = {
  active: "Đang học",
  inactive: "Nghỉ học",
};

export const TUITION_STATUS_LABELS: Record<TuitionStatusType, string> = {
  paid: "Đã đóng",
  pending: "Chờ đóng",
  overdue: "Quá hạn",
};

// ==================== CONSTANTS ====================

/** Danh sách lớp để chọn (phải khớp với Admin classes mockData IDs) */
export const CLASS_OPTIONS: { id: number; name: string }[] = [
  { id: 1,  name: "Toán 10A" },
  { id: 2,  name: "IELTS-01" },
  { id: 3,  name: "Hóa 11-A" },
  { id: 4,  name: "Văn 12" },
  { id: 5,  name: "Lý 10-B" },
  { id: 6,  name: "TOEIC-A1" },
  { id: 7,  name: "Sinh Học 12" },
  { id: 8,  name: "Tin Học Cơ Bản" },
  { id: 9,  name: "IELTS-02" },
  { id: 10, name: "Toán 12-A" },
  { id: 11, name: "Anh Văn Giao Tiếp" },
  { id: 12, name: "Toán 10-B" },
];

export const DROP_REASONS = [
  "Bận việc cá nhân",
  "Chuyển trung tâm",
  "Tài chính",
  "Lý do sức khỏe",
  "Không hài lòng chất lượng",
  "Khác",
] as const;
