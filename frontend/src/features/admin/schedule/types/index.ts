export type SessionStatus = "upcoming" | "completed" | "cancelled";
export type SessionType = "regular" | "makeup" | "extra";

export interface ScheduledSession {
  id: number;
  classId: number;       // FK → Class.id (numeric)
  className: string;
  teacherId: number;     // FK → Teacher.id
  teacherName: string;
  facilityId: string;
  facilityName: string;
  facilityShort: string;
  room: string;
  roomId?: number;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  students: number;
  status: SessionStatus;
  type: SessionType;
  classStatus: "active" | "upcoming" | "completed";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassRef {
  id: number;            // FK → Class.id (numeric)
  name: string;
  subjectName: string;
  teacherId: number;     // FK → Teacher.id
  teacherName: string;
  defaultStartTime: string;
  defaultEndTime: string;
  students: number;
}

export interface AddSessionDTO {
  type: "makeup" | "extra";
  classId: number;       // FK → Class.id (numeric)
  teacherId: number;     // FK → Teacher.id
  teacherName: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  facilityId: string;
  room: string;
  notes?: string;
}

export interface ScheduleStats {
  todaySessions: number;
  totalSessions: number;
  upcomingSessions: number;
  extraOrMakeupSessions: number;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  message?: string;
}

export interface WeekDay {
  date: string; // "YYYY-MM-DD"
  dayLabel: string; // "Thứ 2" … "Chủ nhật"
  dateLabel: string; // "16/12"
}

// ── Constants ──────────────────────────────────────────────────────────────────

export const FACILITIES = [
  { id: "q1", name: "Cơ sở Quận 1", short: "Q1" },
  { id: "q3", name: "Cơ sở Quận 3", short: "Q3" },
  { id: "td", name: "Cơ sở Thủ Đức", short: "TĐ" },
] as const;

export const ROOMS_BY_FACILITY: Record<string, string[]> = {
  q1: ["Phòng 101", "Phòng 102", "Phòng 201 - Lab", "Phòng 202", "Hội trường A"],
  q3: ["Phòng A1", "Phòng A2", "Phòng B1 - Lab", "Phòng B2"],
  td: ["Phòng TD-01", "Phòng TD-02", "Phòng TD-Lab", "Phòng TD-03"],
};

/** Index 0 = Sunday, 1 = Monday … 6 = Saturday */
export const DAY_LABELS = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
] as const;

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  regular: "Thường",
  makeup: "Bù",
  extra: "Thêm",
};

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  upcoming: "Sắp diễn ra",
  completed: "Đã xong",
  cancelled: "Đã hủy",
};

export const TEACHER_REFS = [
  "Nguyễn Thị Mai",
  "Trần Văn Hùng",
  "Lê Thị Hương",
  "Phạm Minh Tuấn",
  "Hoàng Thị Lan",
] as const;

/** The Monday of the demo week shown in mock data */
export const DEMO_WEEK_START = "2024-12-16";
