/**
 * ============================================================================
 * MODULE LỚP HỌC - TYPE DEFINITIONS
 * ============================================================================
 *
 * Nghiệp vụ:
 * - Quản lý lớp học (CRUD)
 * - Mỗi lớp gắn với môn học, giáo viên, phòng học, lịch theo ngày trong tuần
 * - Admin tạo lớp → status "upcoming"
 * - Khi lớp bắt đầu → admin/system chuyển sang "active"
 * - Kết thúc lớp (endClass) → status "completed", endDate = today
 * - Không xóa lớp đang "active" → phải kết thúc trước
 * - Chỉ lớp active/upcoming mới được kết thúc
 * ============================================================================
 */

// ==================== ENUMS ====================

export const ClassStatus = {
  UPCOMING: "upcoming",
  ACTIVE: "active",
  COMPLETED: "completed",
} as const;

export type ClassStatusType =
  (typeof ClassStatus)[keyof typeof ClassStatus];

// ==================== SUB-TYPES ====================

/** Một buổi học trong tuần */
export interface SessionSlot {
  /** 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7 */
  weekday: number;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface TeacherRef {
  id: number;
  name: string;
  avatar: string;
}

// ==================== ENTITY ====================

export interface Class {
  id: number;
  name: string;
  subject: string;
  teacher: TeacherRef;
  facility: string;
  room: string;
  students: number;       // Số học viên hiện tại
  maxStudents: number;    // Sĩ số tối đa (1-200)
  pricePerSession: number; // Giá tiền mỗi buổi học (VND) — dùng để tính học phí
  schedule: SessionSlot[];
  startDate: string;      // YYYY-MM-DD
  endDate: string | null;
  status: ClassStatusType;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== DTOs ====================

/** Tạo mới — status mặc định "upcoming" */
export interface CreateClassDTO {
  name: string;
  subject: string;
  teacherId: number;
  facility: string;
  room: string;
  maxStudents: number;
  pricePerSession: number; // VND
  schedule: SessionSlot[];
  startDate: string;
  description?: string;
}

/** Cập nhật — cho phép đổi status thủ công (upcoming ↔ active) */
export interface UpdateClassDTO {
  name?: string;
  subject?: string;
  teacherId?: number;
  facility?: string;
  room?: string;
  maxStudents?: number;
  pricePerSession?: number;
  schedule?: SessionSlot[];
  startDate?: string;
  description?: string;
  status?: ClassStatusType;
}

// ==================== QUERY PARAMS ====================

export interface ClassQueryParams {
  search?: string;
  subject?: string;
  facility?: string;
  status?: ClassStatusType;
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

export interface ClassStats {
  totalClasses: number;
  activeClasses: number;
  upcomingClasses: number;
  totalStudents: number; // Tổng học viên trên tất cả lớp active
}

// ==================== LABEL MAPS ====================

export const CLASS_STATUS_LABELS: Record<ClassStatusType, string> = {
  upcoming: "Sắp mở",
  active: "Đang học",
  completed: "Đã kết thúc",
};

// ==================== CONSTANTS ====================

export const SUBJECT_OPTIONS = [
  "Toán",
  "Vật Lý",
  "Hóa Học",
  "Sinh Học",
  "Tiếng Anh",
  "Văn",
  "Tin Học",
] as const;

export type SubjectType = (typeof SUBJECT_OPTIONS)[number];

export const FACILITY_OPTIONS = [
  "Cơ sở Quận 1",
  "Cơ sở Quận 3",
  "Cơ sở Thủ Đức",
] as const;

export type FacilityType = (typeof FACILITY_OPTIONS)[number];

/** value: 0=CN, 1=T2, ..., 6=T7 — khớp với JS Date.getDay() */
export const WEEKDAYS = [
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
  { value: 0, label: "CN" },
] as const;

/** Chuyển SessionSlot[] → chuỗi hiển thị ngắn gọn, ví dụ "T2 18:00–20:00 | T4 18:00–20:00" */
export function formatSchedule(slots: SessionSlot[]): string {
  if (!slots.length) return "Chưa có lịch";
  return slots
    .map((s) => {
      const wd = WEEKDAYS.find((w) => w.value === s.weekday);
      return `${wd?.label ?? "?"} ${s.startTime}–${s.endTime}`;
    })
    .join(" | ");
}
