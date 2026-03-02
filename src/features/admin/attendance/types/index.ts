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
  classId: string;
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

export interface LiveSession {
  id: number;
  classId: string;
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
}

export interface AbsentAlert {
  id: number;
  studentId: number;
  studentName: string;
  classId: string;
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
  classId?: string;
  date?: string; // "YYYY-MM-DD"
}

export const ATTENDANCE_CLASS_LIST = [
  { id: "toan10a", name: "Toán 10A" },
  { id: "anhvanb1", name: "Anh Văn B1" },
  { id: "hoa11", name: "Hóa 11" },
  { id: "van12", name: "Văn 12" },
  { id: "ly10a", name: "Lý 10A" },
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
