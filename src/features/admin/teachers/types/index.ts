/**
 * ============================================================================
 * MODULE GIÁO VIÊN - TYPE DEFINITIONS
 * ============================================================================
 *
 * Nghiệp vụ:
 * - Quản lý thông tin giáo viên (CRUD)
 * - Mỗi giáo viên dạy 1 hoặc nhiều môn
 * - Có tài khoản hệ thống (username/password)
 * - Admin có thể: khóa/mở khóa tài khoản, reset mật khẩu
 * - Không xóa được giáo viên đang phụ trách lớp (classCount > 0)
 * - Tạo mới → status mặc định "active"
 * - Chỉ Edit mới cho phép đổi status
 * ============================================================================
 */

// ==================== ENUMS ====================

export const TeacherStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  LOCKED: "locked",
} as const;

export type TeacherStatusType =
  (typeof TeacherStatus)[keyof typeof TeacherStatus];

// ==================== ENTITY ====================

export type Gender = "male" | "female" | "other";

export interface Teacher {
  id: number;
  name: string;
  username: string;        // Tên đăng nhập hệ thống
  email: string;
  phone: string;
  avatar: string;
  dateOfBirth: string;     // YYYY-MM-DD
  gender: Gender;
  address: string;
  bio?: string;            // Giới thiệu ngắn
  subjects: string[];
  classCount: number;
  status: TeacherStatusType;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== DTOs ====================

/** Tạo mới — KHÔNG có status (mặc định active) */
export interface CreateTeacherDTO {
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  username: string;
  password: string;
  // Thông tin cá nhân (tùy chọn khi tạo, bắt buộc ở trang sửa profile)
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  bio?: string;
}

/** Cập nhật — CÓ status */
export interface UpdateTeacherDTO {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string;
  subjects?: string[];
  status?: TeacherStatusType;
}

// ==================== QUERY PARAMS ====================

export interface TeacherQueryParams {
  search?: string;
  subject?: string;
  status?: TeacherStatusType;
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

export interface TeacherStats {
  totalTeachers: number;
  activeTeachers: number;
  totalClasses: number;
  totalSubjects: number;
}

// ==================== LABEL MAPS ====================

export const TEACHER_STATUS_LABELS: Record<TeacherStatusType, string> = {
  active: "Đang dạy",
  inactive: "Tạm nghỉ",
  locked: "Bị khóa",
};

/** Phải khớp với danh sách môn học (Subject.name) đang active.
 *  Khi BE xong → thay bằng API call lấy từ GET /subjects?status=active */
export const SUBJECT_OPTIONS = [
  "Toán",
  "Vật Lý",
  "Hóa Học",
  "Sinh Học",
  "Tiếng Anh",
  "Văn",
  "Tin Học",
  "Địa Lý",
] as const;

export type SubjectType = (typeof SUBJECT_OPTIONS)[number];
