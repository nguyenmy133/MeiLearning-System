import type {
    TeacherSession,
    SessionAttendance,
    SaveAttendanceDTO,
    AttendanceQueryParams,
    AttendanceStats,
    AttendeeRecord,
} from "../types";
import { mockSessions, mockAttendeesMap } from "../data/mockData";

// ── Helpers ───────────────────────────────────────────────────────────────────
const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

// ── In-memory DB ──────────────────────────────────────────────────────────────
let sessionDb: TeacherSession[] = clone(mockSessions);
const attendeeDb: Record<number, AttendeeRecord[]> = clone(mockAttendeesMap);

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * Get all sessions for a teacher (optionally filtered by date/classId).
 * Phase 2: GET /api/teacher/sessions?teacherId=&date=&classId=
 */
export async function getTeacherSessions(
    teacherId: number,
    params?: AttendanceQueryParams
): Promise<TeacherSession[]> {
    await randomDelay();
    let result = clone(sessionDb).filter((s: TeacherSession) => s.teacherId === teacherId);

    if (params?.classId) {
        result = result.filter((s: TeacherSession) => s.classId === params.classId);
    }
    if (params?.date) {
        result = result.filter((s: TeacherSession) => s.date === params.date);
    }
    return result;
}

/**
 * Get full session attendance by sessionId.
 * Validates teacher ownership before returning.
 * Phase 2: GET /api/teacher/attendance/session/{sessionId}
 */
export async function getSessionAttendance(
    sessionId: number,
    teacherId: number
): Promise<SessionAttendance> {
    await randomDelay();

    const session = sessionDb.find((s) => s.id === sessionId);
    if (!session) throw new Error("Không tìm thấy buổi học");
    if (session.teacherId !== teacherId) throw new Error("Bạn không có quyền xem buổi học này");

    const attendees = clone(attendeeDb[sessionId] ?? []);
    return { session: clone(session), attendees, attendanceStatus: session.attendanceStatus };
}

/**
 * Save attendance (draft or confirm).
 * - Draft: saves progress, can be re-edited
 * - Confirm: marks session as 'confirmed', auto-marks 'pending' as 'absent', CANNOT be undone
 * Phase 2: POST /api/teacher/attendance/session/{sessionId}/save  (draft)
 *          PUT  /api/teacher/attendance/session/{sessionId}/confirm
 */
export async function saveAttendance(
    teacherId: number,
    dto: SaveAttendanceDTO
): Promise<SessionAttendance> {
    await randomDelay();

    const sessionIdx = sessionDb.findIndex((s) => s.id === dto.sessionId);
    if (sessionIdx === -1) throw new Error("Không tìm thấy buổi học");
    const session = sessionDb[sessionIdx];
    if (session.teacherId !== teacherId) throw new Error("Bạn không có quyền điểm danh buổi học này");
    if (session.attendanceStatus === "confirmed") {
        throw new Error("Buổi học đã được chốt điểm danh. Không thể sửa đổi.");
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // Apply updates
    const currentAttendees = attendeeDb[dto.sessionId] ?? [];
    dto.attendees.forEach((upd) => {
        const idx = currentAttendees.findIndex((a) => a.studentId === upd.studentId);
        if (idx !== -1) {
            currentAttendees[idx] = {
                ...currentAttendees[idx],
                status: upd.status,
                method: upd.method ?? "manual",
                checkinTime: upd.status === "absent" || upd.status === "absent_excused" ? null : timeStr,
            };
        }
    });
    attendeeDb[dto.sessionId] = currentAttendees;

    if (dto.confirm) {
        // Auto-mark pending as absent
        attendeeDb[dto.sessionId] = currentAttendees.map((a) =>
            a.status === "pending" ? { ...a, status: "absent" as const } : a
        );
        sessionDb[sessionIdx] = { ...session, attendanceStatus: "confirmed", status: "completed" };
    } else {
        sessionDb[sessionIdx] = { ...session, attendanceStatus: "in_progress" };
    }

    return getSessionAttendance(dto.sessionId, teacherId);
}

/**
 * Compute stats for a given session's attendee list.
 */
export async function getAttendanceStats(sessionId: number): Promise<AttendanceStats> {
    await randomDelay();
    const attendees = attendeeDb[sessionId] ?? [];
    const total = attendees.length;
    const present = attendees.filter((a) => a.status === "present").length;
    const late = attendees.filter((a) => a.status === "late").length;
    const absentExcused = attendees.filter((a) => a.status === "absent_excused").length;
    const absent = attendees.filter((a) => a.status === "absent").length;
    const pending = attendees.filter((a) => a.status === "pending").length;
    return {
        total,
        present,
        late,
        absentExcused,
        absent,
        pending,
        attendanceRate: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
    };
}

/** Reset in-memory DB (dev/test utility) */
export function resetAttendanceData(): void {
    sessionDb = clone(mockSessions);
    Object.keys(attendeeDb).forEach((k) => delete attendeeDb[Number(k)]);
    Object.assign(attendeeDb, clone(mockAttendeesMap));
}
