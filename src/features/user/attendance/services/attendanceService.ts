import type {
    AttendanceRecord,
    AttendanceSummary,
    CheckInPayload,
} from "../types";

const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ATTENDANCE: AttendanceRecord[] = [
    {
        id: "att-001",
        sessionId: "sess-002",
        classId: "class-anh-10a",
        className: "Tiếng Anh 10A",
        date: "2026-03-04",
        sessionTime: "08:00 - 10:00",
        status: "PRESENT",
        isBillable: true,
        checkedInAt: "2026-03-04T07:58:00Z",
    },
    {
        id: "att-002",
        sessionId: "sess-003",
        classId: "class-toan-10a",
        className: "Toán 10A",
        date: "2026-03-03",
        sessionTime: "18:00 - 20:00",
        status: "ABSENT_EXCUSED",
        isBillable: false,   // ← NOT billed (approved leave)
        note: "Đơn xin nghỉ đã được Giáo viên duyệt.",
    },
    {
        id: "att-003",
        sessionId: "sess-101",
        classId: "class-toan-10a",
        className: "Toán 10A",
        date: "2026-02-28",
        sessionTime: "18:00 - 20:00",
        status: "ABSENT_UNEXCUSED",
        isBillable: true,   // ← Still billed (no leave)
    },
    {
        id: "att-004",
        sessionId: "sess-102",
        classId: "class-toan-10a",
        className: "Toán 10A",
        date: "2026-02-26",
        sessionTime: "18:00 - 20:00",
        status: "LATE",
        isBillable: true,
        checkedInAt: "2026-02-26T18:18:00Z",
        note: "Đến muộn 18 phút.",
    },
];

let db: AttendanceRecord[] = clone(MOCK_ATTENDANCE);

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Get attendance history for current user.
 * Phase 2: GET /api/user/attendance?classId=&month=
 */
export async function getMyAttendance(classId?: string): Promise<AttendanceRecord[]> {
    await randomDelay();
    let result = clone(db);
    if (classId && classId !== "all") {
        result = result.filter((r: AttendanceRecord) => r.classId === classId);
    }
    return result.sort((a: AttendanceRecord, b: AttendanceRecord) =>
        b.date.localeCompare(a.date)
    );
}

/**
 * Get attendance summary per class.
 * Phase 2: GET /api/user/attendance/summary
 */
export async function getAttendanceSummary(): Promise<AttendanceSummary[]> {
    await randomDelay();
    const records = clone(db);
    const grouped: Record<string, AttendanceRecord[]> = {};

    records.forEach((r: AttendanceRecord) => {
        if (!grouped[r.classId]) grouped[r.classId] = [];
        grouped[r.classId].push(r);
    });

    return Object.entries(grouped).map(([classId, recs]) => {
        const present = recs.filter((r) => r.status === "PRESENT").length;
        const absentExcused = recs.filter((r) => r.status === "ABSENT_EXCUSED").length;
        const absentUnexcused = recs.filter((r) => r.status === "ABSENT_UNEXCUSED").length;
        const late = recs.filter((r) => r.status === "LATE").length;
        const total = recs.length;
        return {
            classId,
            className: recs[0].className,
            totalSessions: total,
            present,
            absentExcused,
            absentUnexcused,
            late,
            attendanceRate: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
        };
    });
}

/**
 * Perform QR check-in for a session.
 * Phase 2: POST /api/user/attendance/check-in
 * BE will:
 *   1. Validate QR signature
 *   2. Validate time window (e.g. ±15 min from session start)
 *   3. Update Attendance record → status = PRESENT, isBillable = true
 */
export async function checkIn(payload: CheckInPayload): Promise<AttendanceRecord> {
    await randomDelay();

    // Mock: simply mark the session as PRESENT
    const existing = db.find((r) => r.sessionId === payload.sessionId);
    if (existing) {
        existing.status = "PRESENT";
        existing.isBillable = true;
        existing.checkedInAt = new Date().toISOString();
        return clone(existing);
    }

    throw new Error("Không tìm thấy buổi học. Vui lòng kiểm tra lại mã QR.");
}
