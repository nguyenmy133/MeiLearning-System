import { apiClient } from "@/lib/api-client";
import type {
  ScheduledSession,
  ClassRef,
  ScheduleStats,
  ConflictCheckResult,
  AddSessionDTO,
} from "../types";

/** Fetch sessions for the given week (with optional facility/teacher filter) */
export async function getWeekSessions(
  facilityId?: string,
  teacherId?: number,
  weekStart?: string
): Promise<ScheduledSession[]> {
  try {
    const { data } = await apiClient.get("/schedule", {
      params: { view: "week", date: weekStart, facilityId, teacherId },
    });
    // Backend returns ScheduleResponse { sessions: ClassSessionResponse[] }
    const rawSessions = data?.sessions ?? [];
    return rawSessions.map((s: any) => ({
      id: s.id,
      classId: s.classId,
      className: s.className ?? "",
      teacherId: 0,
      teacherName: s.teacherName ?? "",
      facilityId: s.facilityId != null ? String(s.facilityId) : "",
      facilityName: s.facilityName ?? "",
      facilityShort: s.facilityName ?? "",
      room: s.roomName ?? "",
      roomId: s.roomId ?? undefined,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      students: s.totalStudents ?? 0,
      status: s.status ?? "upcoming",
      type: s.type ?? "regular",
      classStatus: s.classStatus ?? "active",
      notes: s.notes,
      createdAt: s.createdAt ?? "",
      updatedAt: "",
    }));
  } catch {
    return [];
  }
}

/** Get schedule summary stats — derived from actual session data */
export async function getScheduleStats(): Promise<ScheduleStats> {
  try {
    const scheduleRes = await apiClient.get("/schedule", { params: { view: "week" } });
    const sessions: any[] = scheduleRes.data?.sessions ?? [];
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    const todaySessions = sessions.filter((s) => s.date === today).length;
    const upcomingSessions = sessions.filter((s) => s.status === "upcoming" || s.status === "scheduled").length;
    const extraOrMakeupSessions = sessions.filter(
      (s) => s.type === "makeup" || s.type === "extra"
    ).length;

    return {
      todaySessions,
      totalSessions: sessions.length,
      upcomingSessions,
      extraOrMakeupSessions,
    };
  } catch {
    return {
      todaySessions: 0,
      totalSessions: 0,
      upcomingSessions: 0,
      extraOrMakeupSessions: 0,
    };
  }
}

/** Get class references for the "add session" dialog */
export async function getClassRefs(): Promise<ClassRef[]> {
  try {
    // Fetch only active + upcoming classes
    const [activeRes, upcomingRes] = await Promise.all([
      apiClient.get("/classes", { params: { limit: 200, status: "active" } }),
      apiClient.get("/classes", { params: { limit: 200, status: "upcoming" } }),
    ]);
    const activeList = Array.isArray(activeRes.data) ? activeRes.data : activeRes.data?.data ?? [];
    const upcomingList = Array.isArray(upcomingRes.data) ? upcomingRes.data : upcomingRes.data?.data ?? [];
    const list = [...activeList, ...upcomingList];
    // ClassResponse has nested teacher: {id, name} and schedule: [{weekday, startTime, endTime}]
    return list.map((c: any) => {
      const firstSlot = Array.isArray(c.schedule) && c.schedule.length > 0 ? c.schedule[0] : null;
      return {
        id: c.id,
        name: c.name ?? `Lớp #${c.id}`,
        subjectName: c.subject ?? "",
        teacherId: c.teacher?.id ?? 0,
        teacherName: c.teacher?.name ?? "",
        defaultStartTime: firstSlot?.startTime ?? "08:00",
        defaultEndTime: firstSlot?.endTime ?? "10:00",
        students: c.students ?? 0,
      };
    });
  } catch {
    return [];
  }
}

/** Check for scheduling conflicts — disabled until backend endpoint exists */
export async function checkConflict(
  _date: string,
  _startTime: string,
  _endTime: string,
  _facilityId: string,
  _room: string,
  _excludeId?: number
): Promise<ConflictCheckResult> {
  // TODO: implement backend endpoint GET /schedule/check-conflict
  return { hasConflict: false };
}

/** Add a new make-up / extra session */
export async function addSession(dto: AddSessionDTO): Promise<ScheduledSession> {
  try {
    const { data } = await apiClient.post("/sessions", {
      classId: dto.classId,
      type: dto.type,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      notes: dto.notes,
    });
    return data;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message ?? "Không thể thêm buổi học");
  }
}

/** Update an existing session */
export async function updateSession(id: number, dto: {
  date?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  notes?: string;
  roomId?: number;
}): Promise<void> {
  await apiClient.put(`/sessions/${id}`, dto);
}

/** Delete a session by id */
export async function deleteSession(id: number): Promise<void> {
  await apiClient.delete(`/sessions/${id}`);
}

