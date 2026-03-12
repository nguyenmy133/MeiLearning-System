import { apiClient } from "@/lib/api-client";
import type {
  ScheduledSession,
  ClassRef,
  ScheduleStats,
  ConflictCheckResult,
  AddSessionDTO,
} from "../types";
import { mockSessions, mockClassRefs } from "../data/mockData";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

// ── In-memory fallback (used while BE schedule is not fully wired) ─────────
let db: ScheduledSession[] = clone(mockSessions);
let nextId = Math.max(...db.map((s) => s.id)) + 1;

/** Fetch sessions for the current week (with optional facility/teacher filter) */
export async function getWeekSessions(
  facilityId?: string,
  teacherId?: number
): Promise<ScheduledSession[]> {
  try {
    const { data } = await apiClient.get("/schedule", {
      params: { view: "week", facilityId, teacherId },
    });
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    // fallback below
  }

  // Fallback to mock
  let result = clone(db);
  if (facilityId) result = result.filter((s) => s.facilityId === facilityId);
  if (teacherId) result = result.filter((s) => s.teacherId === teacherId);
  return result;
}

/** Get schedule summary stats */
export async function getScheduleStats(): Promise<ScheduleStats> {
  return {
    totalSessions: db.length,
    activeClasses: new Set(db.map((s) => s.classId)).size,
    completedSessions: db.filter((s) => s.status === "completed").length,
    activeTeachers: new Set(db.map((s) => s.teacherId)).size,
  };
}

/** Get class references for the "add session" dialog */
export async function getClassRefs(): Promise<ClassRef[]> {
  try {
    const { data } = await apiClient.get("/classes");
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    // fallback below
  }
  return clone(mockClassRefs);
}

/** Check for scheduling conflicts */
export async function checkConflict(
  date: string,
  startTime: string,
  endTime: string,
  facilityId: string,
  room: string,
  excludeId?: number
): Promise<ConflictCheckResult> {
  const conflict = db.find(
    (s) =>
      s.id !== excludeId &&
      s.date === date &&
      s.facilityId === facilityId &&
      s.room === room &&
      s.status !== "cancelled" &&
      s.startTime < endTime &&
      s.endTime > startTime
  );
  if (conflict) {
    return {
      hasConflict: true,
      message: `Trùng lịch với ${conflict.className} (${conflict.startTime}–${conflict.endTime})`,
    };
  }
  return { hasConflict: false };
}

/** Add a new make-up / extra session */
export async function addSession(dto: AddSessionDTO): Promise<ScheduledSession> {
  const classRef = mockClassRefs.find((c) => c.id === dto.classId);
  const now = new Date().toISOString();
  const session: ScheduledSession = {
    id: nextId++,
    classId: dto.classId,
    className: classRef?.name ?? `Lớp #${dto.classId}`,
    teacherId: dto.teacherId,
    teacherName: dto.teacherName,
    facilityId: dto.facilityId,
    facilityName: "",
    facilityShort: dto.facilityId.toUpperCase(),
    room: dto.room,
    date: dto.date,
    startTime: dto.startTime,
    endTime: dto.endTime,
    students: classRef?.students ?? 0,
    status: "upcoming",
    type: dto.type,
    notes: dto.notes,
    createdAt: now,
    updatedAt: now,
  };
  db.push(session);
  return clone(session);
}

/** Cancel a session by id */
export async function cancelSession(id: number): Promise<void> {
  const session = db.find((s) => s.id === id);
  if (!session) throw new Error("Không tìm thấy buổi học");
  if (session.status === "completed") throw new Error("Không thể hủy buổi đã hoàn thành");
  session.status = "cancelled";
  session.updatedAt = new Date().toISOString();
}

/** Reset mock data */
export function resetScheduleData(): void {
  db = clone(mockSessions);
  nextId = Math.max(...db.map((s) => s.id)) + 1;
}
