// ─── Schedule & Class Session Types ──────────────────────────────────────────

export type ClassStatus = "upcoming" | "active" | "completed";
export type SessionStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
export type AttendanceStatus = "PRESENT" | "ABSENT_EXCUSED" | "ABSENT_UNEXCUSED" | "LATE" | null;

export interface ClassInfo {
    id: string;
    name: string;
    subject: string;
    teacherName: string;
    /** e.g. "Mon Wed Fri" */
    schedule: string;
    sessionTime: string;   // "HH:MM - HH:MM"
    room: string;
    status: ClassStatus;
    /** ISO date string when class ended / was closed */
    closedAt?: string;
    /** Based on closedAt + 1 year. FE checks to hide archived content */
    accessExpiresAt?: string;
    totalSessions: number;
    completedSessions: number;
}

export interface ClassSession {
    id: string;
    classId: string;
    className: string;
    subject: string;
    teacherName: string;
    date: string;          // "YYYY-MM-DD"
    startTime: string;     // "HH:MM"
    endTime: string;       // "HH:MM"
    room: string;
    status: SessionStatus;
    attendanceStatus: AttendanceStatus;
    /** QR check-in is available only for ongoing/upcoming sessions of today */
    canCheckIn: boolean;
}
