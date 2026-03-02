import type {
  AttendanceSession,
  LiveSession,
  AbsentAlert,
  AttendanceStats,
  AttendanceQueryParams,
  AttendanceRecord,
  AttendanceRecordStatus,
} from "../types";
import {
  mockAttendanceSessions,
  mockLiveSessions,
  mockAbsentAlerts,
  mockAttendanceRecords,
} from "../data/mockData";

// ── Helpers ───────────────────────────────────────────────────────────────────
const randomDelay = () =>
  new Promise((res) => setTimeout(res, 300 + Math.random() * 400));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

// ── In-memory DB ──────────────────────────────────────────────────────────────
let sessionDb: AttendanceSession[] = clone(mockAttendanceSessions);
let liveDb: LiveSession[] = clone(mockLiveSessions);
const alertDb: AbsentAlert[] = clone(mockAbsentAlerts);let recordDb: AttendanceRecord[] = clone(mockAttendanceRecords);
let nextRecordId = Math.max(...recordDb.map((r) => r.id), 0) + 1;
// ── Service ───────────────────────────────────────────────────────────────────

export async function getAttendanceSessions(
  params?: AttendanceQueryParams
): Promise<AttendanceSession[]> {
  await randomDelay();
  let result = clone(sessionDb);

  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (s: AttendanceSession) =>
        s.className.toLowerCase().includes(q) ||
        s.teacherName.toLowerCase().includes(q)
    );
  }
  if (params?.classId && params.classId !== "all") {
    result = result.filter((s: AttendanceSession) => s.classId === params.classId);
  }
  if (params?.date) {
    result = result.filter((s: AttendanceSession) => s.date === params.date);
  }

  return result.sort(
    (a: AttendanceSession, b: AttendanceSession) =>
      b.date.localeCompare(a.date)
  );
}

export async function getAttendanceStats(): Promise<AttendanceStats> {
  await randomDelay();
  const totalStudents = sessionDb.reduce((acc, s) => acc + s.total, 0);
  const averageRate =
    sessionDb.length > 0
      ? Math.round(
          sessionDb.reduce((acc, s) => acc + s.rate, 0) / sessionDb.length
        )
      : 0;
  const totalLate = sessionDb.reduce((acc, s) => acc + s.late, 0);
  return {
    totalStudents,
    averageRate,
    totalLate,
    alertCount: alertDb.length,
  };
}

export async function getLiveSessions(): Promise<LiveSession[]> {
  await randomDelay();
  return clone(liveDb);
}

export async function getAbsentAlerts(): Promise<AbsentAlert[]> {
  await randomDelay();
  return clone(alertDb);
}

/** Toggle QR code on/off for a live session */
export async function toggleQR(sessionId: number): Promise<LiveSession> {
  await randomDelay();
  const idx = liveDb.findIndex((s) => s.id === sessionId);
  if (idx === -1) throw new Error("Không tìm thấy buổi học");
  liveDb[idx] = { ...liveDb[idx], qrActive: !liveDb[idx].qrActive };
  return clone(liveDb[idx]);
}

/**
 * [GET] /api/attendance/sessions/:id/records
 * Danh sách điểm danh từng học viên trong 1 buổi học
 */
export async function getSessionRecords(
  sessionId: number
): Promise<AttendanceRecord[]> {
  await randomDelay();
  return clone(recordDb.filter((r) => r.sessionId === sessionId));
}

/**
 * [PATCH] /api/attendance/records/:id
 * Admin sửa thủ công trạng thái điểm danh của 1 học viên
 */
export async function updateAttendanceRecord(
  recordId: number,
  status: AttendanceRecordStatus,
  note?: string
): Promise<AttendanceRecord> {
  await randomDelay();
  const idx = recordDb.findIndex((r) => r.id === recordId);
  if (idx === -1) throw new Error("Không tìm thấy bản ghi điểm danh");
  recordDb[idx] = {
    ...recordDb[idx],
    status,
    checkInTime: status === "absent" ? null : recordDb[idx].checkInTime ?? new Date().toTimeString().slice(0, 5),
    method: status === "absent" ? null : (recordDb[idx].method ?? "manual"),
    note: note !== undefined ? note : recordDb[idx].note,
  };
  // Recalculate aggregate on parent session
  const sessionRecords = recordDb.filter((r) => r.sessionId === recordDb[idx].sessionId);
  const sessIdx = sessionDb.findIndex((s) => s.id === recordDb[idx].sessionId);
  if (sessIdx !== -1) {
    const present = sessionRecords.filter((r) => r.status === "present").length;
    const late = sessionRecords.filter((r) => r.status === "late").length;
    const absent = sessionRecords.filter((r) => r.status === "absent").length;
    const total = sessionRecords.length;
    sessionDb[sessIdx] = {
      ...sessionDb[sessIdx],
      present,
      late,
      absent,
      rate: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
      updatedAt: new Date().toISOString(),
    };
  }
  return clone(recordDb[idx]);
}

/** Reset in-memory DB (dev utility) */
export function resetAttendanceData(): void {
  sessionDb = clone(mockAttendanceSessions);
  liveDb = clone(mockLiveSessions);
  recordDb = clone(mockAttendanceRecords);
  nextRecordId = Math.max(...recordDb.map((r) => r.id), 0) + 1;
}
