import type { ClassInfo, ClassSession } from "../types";

const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CLASSES: ClassInfo[] = [
    {
        id: "class-toan-10a",
        name: "Toán 10A",
        subject: "Toán",
        teacherName: "Thầy Nguyễn Văn An",
        schedule: "Thứ 2 - Thứ 4 - Thứ 6",
        sessionTime: "18:00 - 20:00",
        room: "P.101",
        status: "ACTIVE",
        totalSessions: 48,
        completedSessions: 12,
    },
    {
        id: "class-anh-10a",
        name: "Tiếng Anh 10A",
        subject: "Tiếng Anh",
        teacherName: "Cô Trần Thị Bình",
        schedule: "Thứ 3 - Thứ 5",
        sessionTime: "08:00 - 10:00",
        room: "P.205",
        status: "ACTIVE",
        totalSessions: 32,
        completedSessions: 8,
    },
    {
        // Class that is CLOSED — User can still view documents for 1 year
        id: "class-ly-9b",
        name: "Vật Lý 9B",
        subject: "Vật Lý",
        teacherName: "Thầy Lê Minh Cường",
        schedule: "Thứ 7",
        sessionTime: "14:00 - 16:00",
        room: "P.301",
        status: "COMPLETED",
        closedAt: "2025-12-31T00:00:00Z",
        accessExpiresAt: "2026-12-31T00:00:00Z",
        totalSessions: 24,
        completedSessions: 24,
    },
];

const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

const MOCK_SESSIONS: ClassSession[] = [
    {
        id: "sess-001",
        classId: "class-toan-10a",
        className: "Toán 10A",
        subject: "Toán",
        teacherName: "Thầy Nguyễn Văn An",
        date: today,
        startTime: "18:00",
        endTime: "20:00",
        room: "P.101",
        status: "upcoming",
        attendanceStatus: null,
        canCheckIn: true,
    },
    {
        id: "sess-002",
        classId: "class-anh-10a",
        className: "Tiếng Anh 10A",
        subject: "Tiếng Anh",
        teacherName: "Cô Trần Thị Bình",
        date: "2026-03-04",
        startTime: "08:00",
        endTime: "10:00",
        room: "P.205",
        status: "completed",
        attendanceStatus: "PRESENT",
        canCheckIn: false,
    },
    {
        id: "sess-003",
        classId: "class-toan-10a",
        className: "Toán 10A",
        subject: "Toán",
        teacherName: "Thầy Nguyễn Văn An",
        date: "2026-03-03",
        startTime: "18:00",
        endTime: "20:00",
        room: "P.101",
        status: "completed",
        attendanceStatus: "ABSENT_EXCUSED",   // had approved leave → not billed
        canCheckIn: false,
    },
    {
        id: "sess-004",
        classId: "class-toan-10a",
        className: "Toán 10A",
        subject: "Toán",
        teacherName: "Thầy Nguyễn Văn An",
        date: "2026-03-08",
        startTime: "18:00",
        endTime: "20:00",
        room: "P.101",
        status: "upcoming",
        attendanceStatus: null,
        canCheckIn: false,
    },
];

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Get all classes the current user is enrolled in.
 * Includes ACTIVE and COMPLETED (closed) classes.
 * Phase 2: GET /api/user/classes
 */
export async function getMyClasses(): Promise<ClassInfo[]> {
    await randomDelay();
    return clone(MOCK_CLASSES);
}

/**
 * Get schedule sessions within a date range.
 * Phase 2: GET /api/user/schedule?startDate=&endDate=
 */
export async function getMySchedule(
    startDate?: string,
    endDate?: string
): Promise<ClassSession[]> {
    await randomDelay();
    let result = clone(MOCK_SESSIONS);

    if (startDate) {
        result = result.filter((s: ClassSession) => s.date >= startDate);
    }
    if (endDate) {
        result = result.filter((s: ClassSession) => s.date <= endDate);
    }

    return result.sort((a: ClassSession, b: ClassSession) =>
        a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
    );
}

/**
 * Get today's sessions for Dashboard.
 * Phase 2: GET /api/user/schedule/today
 */
export async function getTodaySessions(): Promise<ClassSession[]> {
    await randomDelay();
    const todayStr = new Date().toISOString().split("T")[0];
    return clone(MOCK_SESSIONS).filter((s: ClassSession) => s.date === todayStr);
}
