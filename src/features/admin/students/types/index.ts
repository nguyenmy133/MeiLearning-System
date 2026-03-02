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
  classes: string[];       // Danh sách tên lớp đang học
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
  classes: string[];
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
  classes?: string[];
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
  className?: string;      // Lọc theo lớp
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

export const CLASS_OPTIONS = [
  "IELTS-01",
  "IELTS-02",
  "TOEIC-A1",
  "Toán 12-A",
  "Toán 10-B",
  "Hóa 11-A",
  "Anh Văn Giao Tiếp",
  "Tin Học Cơ Bản",
] as const;

export type ClassOptionType = (typeof CLASS_OPTIONS)[number];

export const DROP_REASONS = [
  "Bận việc cá nhân",
  "Chuyển trung tâm",
  "Tài chính",
  "Lý do sức khỏe",
  "Không hài lòng chất lượng",
  "Khác",
] as const;
