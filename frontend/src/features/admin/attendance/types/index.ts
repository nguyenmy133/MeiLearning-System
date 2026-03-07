export type AttendanceRecordStatus = "present" | "absent" | "late";
export type CheckInMethod = "qr" | "manual";

/** Chi tiết điểm danh từng học viên trong 1 buổi học */
export interface AttendanceRecord {
  id: number;
  sessionId: number;
  studentId: number;
  studentName: string;
  studentAvatar: string;
  status: AttendanceRecordStatus;
  checkInTime: string | null; // "HH:mm" – null nếu absent
  method: CheckInMethod | null; // null nếu absent
  note?: string;
}

export interface AttendanceSession {
  id: number;
  classId: number;       // FK → Class.id (numeric)
  className: string;
  teacherName: string;
  teacherId: number;
  facilityId: string;
  facilityName: string;
  room: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  total: number;
  present: number;
  absent: number;
  late: number;
  rate: number;
  createdAt: string;
  updatedAt: string;
}

/** Ai kích hoạt QR – phân biệt giáo viên tự bật vs Admin override */
export type QrActivatedBy = "teacher" | "admin";

export interface LiveSession {
  id: number;
  classId: number;       // FK → Class.id (numeric)
  className: string;
  teacherName: string;
  teacherId: number;
  facilityId: string;
  facilityName: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  room: string;
  total: number;
  checkedIn: number;
  qrActive: boolean;
  /** Người kích hoạt QR cuối cùng — null khi qrActive = false */
  activeBy: QrActivatedBy | null;
}

export interface AbsentAlert {
  id: number;
  studentId: number;
  studentName: string;
  classId: number;       // FK → Class.id (numeric)
  className: string;
  absences: number;
  consecutiveAbsences: number; // số buổi vắng liên tiếp
  lastAttended: string; // "DD/MM/YYYY"
  parentPhone: string;
}

export interface AttendanceStats {
  totalStudents: number;
  averageRate: number;
  totalLate: number;
  alertCount: number;
}

export interface AttendanceQueryParams {
  search?: string;
  classId?: number | string; // number FK hoặc "all"
  date?: string; // "YYYY-MM-DD"
  teacherId?: number;
}

/** Phải khớp với Class.id + Class.name trong classes/data/mockData.
 *  Khi BE xong → thay bằng API call GET /classes?status=active */
export const ATTENDANCE_CLASS_LIST = [
  { id: 1, name: "Toán 10A" },
  { id: 2, name: "IELTS-01" },
  { id: 3, name: "Hóa 11-A" },
  { id: 4, name: "Văn 12 - Luyện thi" },
  { id: 6, name: "TOEIC-A1" },
] as const;

export const ATTENDANCE_RECORD_STATUS_LABELS: Record<AttendanceRecordStatus, string> = {
  present: "Có mặt",
  absent: "Vắng mặt",
  late: "Đi muộn",
};

export const CHECK_IN_METHOD_LABELS: Record<CheckInMethod, string> = {
  qr: "Quét QR",
  manual: "Thủ công",
};
