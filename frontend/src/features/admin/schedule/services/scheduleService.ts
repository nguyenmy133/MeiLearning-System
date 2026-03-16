import { apiClient } from "@/lib/api-client";
import type {
  ScheduledSession,
  ClassRef,
  ScheduleStats,
  ConflictCheckResult,
  AddSessionDTO,
} from "../types";

/** Fetch sessions for the current week (with optional facility/teacher filter) */
export async function getWeekSessions(
  facilityId?: string,
  teacherId?: number
): Promise<ScheduledSession[]> {
  try {
    const { data } = await apiClient.get("/schedule", {
      params: { view: "week", facilityId, teacherId },
    });
    const sessions = Array.isArray(data) ? data : data?.sessions ?? data?.data ?? [];
    return sessions;
  } catch {
    return [];
  }
}

/** Get schedule summary stats */
export async function getScheduleStats(): Promise<ScheduleStats> {
  try {
    const { data: classStats } = await apiClient.get("/classes/stats");
    return {
      totalSessions: classStats?.totalClasses ?? 0,
      activeClasses: classStats?.activeClasses ?? 0,
      completedSessions: 0,
      activeTeachers: 0,
    };
  } catch {
    return {
      totalSessions: 0,
      activeClasses: 0,
      completedSessions: 0,
      activeTeachers: 0,
    };
  }
}

/** Get class references for the "add session" dialog */
export async function getClassRefs(): Promise<ClassRef[]> {
  try {
    const { data } = await apiClient.get("/classes");
    const list = Array.isArray(data) ? data : data?.data ?? [];
    return list.map((c: any) => ({
      id: c.id,
      name: c.name ?? c.className ?? `Lớp #${c.id}`,
      teacherId: c.teacherId ?? 0,
      teacherName: c.teacherName ?? "",
      defaultStartTime: c.startTime ?? "08:00",
      defaultEndTime: c.endTime ?? "10:00",
      students: c.currentStudents ?? c.students ?? 0,
    }));
  } catch {
    return [];
  }
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
  // If backend has a conflict-check endpoint, use it; otherwise just return no conflict
  try {
    const { data } = await apiClient.get("/schedule/check-conflict", {
      params: { date, startTime, endTime, facilityId, room, excludeId },
    });
    return data;
  } catch {
    // No conflict-check endpoint yet, return no conflict
    return { hasConflict: false };
  }
}

/** Add a new make-up / extra session */
export async function addSession(dto: AddSessionDTO): Promise<ScheduledSession> {
  try {
    const { data } = await apiClient.post("/schedule", dto);
    return data;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message ?? "Không thể thêm buổi học");
  }
}

/** Cancel a session by id */
export async function cancelSession(id: number): Promise<void> {
  await apiClient.patch(`/schedule/${id}/cancel`);
}
