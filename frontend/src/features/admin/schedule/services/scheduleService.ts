import type {
  ScheduledSession,
  ClassRef,
  AddSessionDTO,
  ScheduleStats,
  ConflictCheckResult,
} from "../types";
import { FACILITIES } from "../types";
import { mockSessions, mockClassRefs } from "../data/mockData";

// ── Helpers ───────────────────────────────────────────────────────────────────
const randomDelay = () =>
  new Promise((res) => setTimeout(res, 300 + Math.random() * 400));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

/** Convert "HH:mm" to minutes for arithmetic comparison */
const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** True when [aStart,aEnd) overlaps [bStart,bEnd) */
const timesOverlap = (
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean =>
  toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);

// ── In-memory DB ──────────────────────────────────────────────────────────────
let db: ScheduledSession[] = clone(mockSessions);
let nextId = Math.max(...db.map((s) => s.id)) + 1;

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * Return all sessions, optionally filtered by facilityId.
 * Note: mock data is fixed to the demo week (2024-12-16 to 22). The weekStart
 * parameter is kept for API-compatibility but is currently ignored in mock mode.
 */
export async function getWeekSessions(
  facilityId?: string,
  teacherId?: number
): Promise<ScheduledSession[]> {
  await randomDelay();
  let result = clone(db).filter((s: ScheduledSession) => s.status !== "cancelled");
  if (facilityId && facilityId !== "all") {
    result = result.filter((s: ScheduledSession) => s.facilityId === facilityId);
  }
  if (teacherId) {
    result = result.filter((s: ScheduledSession) => s.teacherId === teacherId);
  }
  return result.sort((a: ScheduledSession, b: ScheduledSession) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return toMinutes(a.startTime) - toMinutes(b.startTime);
  });
}

/** Aggregate stats for the current week */
export async function getScheduleStats(): Promise<ScheduleStats> {
  await randomDelay();
  const active = db.filter((s) => s.status !== "cancelled");
  return {
    totalSessions: active.length,
    activeClasses: new Set(active.map((s) => s.classId)).size,
    completedSessions: active.filter((s) => s.status === "completed").length,
    activeTeachers: new Set(active.map((s) => s.teacherName)).size,
  };
}

/** Active class references for the "Add session" dropdown */
export async function getClassRefs(): Promise<ClassRef[]> {
  await randomDelay();
  return clone(mockClassRefs);
}

/**
 * Synchronous conflict check — usable from UI without a query.
 * Checks teacher schedule and room occupancy.
 */
export function checkConflict(
  date: string,
  startTime: string,
  endTime: string,
  teacherName: string,
  facilityId: string,
  room: string,
  excludeId?: number
): ConflictCheckResult {
  const sameDaySessions = db.filter(
    (s) => s.date === date && s.status !== "cancelled" && s.id !== (excludeId ?? -1)
  );

  for (const s of sameDaySessions) {
    if (!timesOverlap(startTime, endTime, s.startTime, s.endTime)) continue;

    if (s.teacherName === teacherName) {
      return {
        hasConflict: true,
        message: `Trùng lịch giáo viên: ${teacherName} đang dạy lớp ${s.className} vào thời gian này.`,
      };
    }
    if (s.facilityId === facilityId && s.room === room) {
      return {
        hasConflict: true,
        message: `Trùng phòng: ${room} đang được lớp ${s.className} sử dụng vào thời gian này.`,
      };
    }
  }

  return { hasConflict: false };
}

/** Add a makeup / extra session. Throws on conflict. */
export async function addSession(dto: AddSessionDTO): Promise<ScheduledSession> {
  await randomDelay();

  // Validate class exists
  const classRef = mockClassRefs.find((c) => c.id === dto.classId);
  if (!classRef) throw new Error("Không tìm thấy lớp học");

  // Validate facility
  const facility = FACILITIES.find((f) => f.id === dto.facilityId);
  if (!facility) throw new Error("Không tìm thấy cơ sở");

  // Validate time
  if (toMinutes(dto.startTime) >= toMinutes(dto.endTime)) {
    throw new Error("Giờ bắt đầu phải trước giờ kết thúc");
  }

  // Conflict check
  const conflict = checkConflict(
    dto.date,
    dto.startTime,
    dto.endTime,
    dto.teacherName,
    dto.facilityId,
    dto.room
  );
  if (conflict.hasConflict) throw new Error(conflict.message);

  const now = new Date().toISOString();
  const session: ScheduledSession = {
    id: nextId++,
    classId: dto.classId,
    className: classRef.name,
    teacherId: dto.teacherId,
    teacherName: dto.teacherName,
    facilityId: dto.facilityId,
    facilityName: facility.name,
    facilityShort: facility.short,
    room: dto.room,
    date: dto.date,
    startTime: dto.startTime,
    endTime: dto.endTime,
    students: classRef.students,
    status: "upcoming",
    type: dto.type,
    notes: dto.notes,
    createdAt: now,
    updatedAt: now,
  };
  db.push(session);
  return clone(session);
}

/** Mark a session as cancelled */
export async function cancelSession(id: number): Promise<void> {
  await randomDelay();
  const idx = db.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Không tìm thấy buổi học");
  db[idx] = { ...db[idx], status: "cancelled", updatedAt: new Date().toISOString() };
}

/** Reset in-memory DB (dev utility) */
export function resetScheduleData(): void {
  db = clone(mockSessions);
  nextId = Math.max(...db.map((s) => s.id)) + 1;
}
