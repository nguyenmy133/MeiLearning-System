// ── Enums & Status Types ──────────────────────────────────────────────────────

export type AttendanceStatus = "present" | "late" | "absent_excused" | "absent" | "pending";
export type SessionStatus = "scheduled" | "ongoing" | "completed" | "cancelled";
export type CheckinMethod = "qr" | "manual";

// ── Core Entities ─────────────────────────────────────────────────────────────

export interface TeacherSession {
    id: number;
    classId: number;
    className: string;
    teacherId: number;
    date: string;           // ISO date string "YYYY-MM-DD"
    startTime: string;      // "HH:MM"
    endTime: string;        // "HH:MM"
    room: string;
    subject: string;
    status: SessionStatus;
    attendanceStatus: "not_started" | "in_progress" | "confirmed";
}

export interface AttendeeRecord {
    id: number;
    studentId: string;      // e.g. "HV001"
    name: string;
    avatar?: string;
    status: AttendanceStatus;
    checkinTime: string | null;   // "HH:MM" or null
    method: CheckinMethod | null;
    absenceCount: number;         // total absences this month
}

export interface SessionAttendance {
    session: TeacherSession;
    attendees: AttendeeRecord[];
    attendanceStatus: "not_started" | "in_progress" | "confirmed";
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface UpdateAttendeeDTO {
    studentId: string;
    status: AttendanceStatus;
    method?: CheckinMethod;
}

export interface SaveAttendanceDTO {
    sessionId: number;
    attendees: UpdateAttendeeDTO[];
    /** true = chốt chính thức, false = lưu nháp */
    confirm: boolean;
}

// ── Query Params ──────────────────────────────────────────────────────────────

export interface AttendanceQueryParams {
    classId?: number;
    /** ISO date string "YYYY-MM-DD" */
    date?: string;
    status?: AttendanceStatus | "all";
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface AttendanceStats {
    total: number;
    present: number;
    late: number;
    absentExcused: number;
    absent: number;
    pending: number;
    attendanceRate: number;
}

// ── Labels ────────────────────────────────────────────────────────────────────

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
    present: "Có mặt",
    late: "Đi muộn",
    absent_excused: "Vắng có phép",
    absent: "Vắng không phép",
    pending: "Chưa điểm danh",
};

export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, string> = {
    present: "bg-green-100 text-green-700 border-green-200",
    late: "bg-yellow-100 text-yellow-700 border-yellow-200",
    absent_excused: "bg-blue-100 text-blue-700 border-blue-200",
    absent: "bg-red-100 text-red-700 border-red-200",
    pending: "bg-muted text-muted-foreground border-border",
};
