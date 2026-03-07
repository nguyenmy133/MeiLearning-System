import type {
    AttendanceRecord,
    AttendanceSummary,
    CheckInPayload,
} from "../types";

const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

import { MOCK_ATTENDANCE } from "../data/mockData";

// ─── Mock Data ────────────────────────────────────────────────────────────────

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
