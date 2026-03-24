import { apiClient } from "@/lib/api-client";
import type { ClassInfo, ClassSession } from "../types";

const WEEKDAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/**
 * Map backend ClassResponse → frontend ClassInfo.
 * Backend returns nested objects (teacher, schedule slots), but FE expects flat fields.
 */
function mapBackendClassToClassInfo(raw: any): ClassInfo {
  // teacher can be { id, name, avatar } or just a string
  const teacherName =
    typeof raw.teacher === "object" && raw.teacher?.name
      ? raw.teacher.name
      : raw.teacherName ?? raw.teacher ?? "N/A";

  // schedule can be an array of { weekday, startTime, endTime } or a string
  let schedule = "";
  let sessionTime = "";
  if (Array.isArray(raw.schedule) && raw.schedule.length > 0) {
    const slots = raw.schedule;
    schedule = slots.map((s: any) => WEEKDAY_NAMES[s.weekday] ?? `Ngày ${s.weekday}`).join(", ");
    sessionTime = `${slots[0].startTime} - ${slots[0].endTime}`;
  } else if (typeof raw.schedule === "string") {
    schedule = raw.schedule;
    sessionTime = raw.sessionTime ?? "";
  }

  return {
    id: String(raw.id),
    name: raw.name ?? "",
    subject: raw.subject ?? "",
    teacherName,
    schedule,
    sessionTime,
    room: raw.room ?? raw.facility ?? "",
    status: raw.status ?? "active",
    closedAt: raw.endDate,
    accessExpiresAt: undefined,
    totalSessions: raw.totalSessions ?? 0,
    completedSessions: raw.completedSessions ?? 0,
    studentCount: raw.students ?? 0,
  };
}

/** Get student's enrolled classes — uses JWT-resolved /enrolled/me endpoint */
export async function getMyClasses(): Promise<ClassInfo[]> {
  const { data } = await apiClient.get("/classes/enrolled/me");
  const rawList = Array.isArray(data) ? data : data?.content ?? [];
  return rawList.map(mapBackendClassToClassInfo);
}

/** Get schedule sessions for a date range — uses JWT-resolved /me endpoint */
export async function getMySchedule(startDate?: string, endDate?: string): Promise<ClassSession[]> {
  const { data } = await apiClient.get("/schedule/student/me", {
    params: { view: "week", date: startDate },
  });
  let rawList: any[] = [];
  // Handle ScheduleResponse — may contain sessions array
  if (data?.sessions && Array.isArray(data.sessions)) rawList = data.sessions;
  else if (Array.isArray(data)) rawList = data;
  return rawList.map(mapBackendSession);
}

/** Get today's sessions — uses JWT-resolved /me endpoint */
export async function getTodaySessions(): Promise<ClassSession[]> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await apiClient.get("/schedule/student/me", {
    params: { view: "day", date: today },
  });
  let rawList: any[] = [];
  if (data?.sessions && Array.isArray(data.sessions)) rawList = data.sessions;
  else if (Array.isArray(data)) rawList = data;
  return rawList.map(mapBackendSession);
}

// Keep backward-compatible named export
export async function getStudentSchedule(_studentId: number, _params?: { date?: string; view?: string }) {
  return getMySchedule();
}

/**
 * Map backend ClassSessionResponse → frontend ClassSession.
 * Backend uses roomName/subjectName, FE uses room/subject.
 * Computes canCheckIn on FE side since BE doesn't provide it.
 */
function mapBackendSession(raw: any): ClassSession {
  const today = new Date().toISOString().split("T")[0];
  const isToday = raw.date === today;
  const isUpcoming = raw.status === "upcoming";
  const hasAttendance = !!raw.attendanceStatus;

  // Compute canCheckIn: session is today, upcoming, not yet attended,
  // and current time is within [startTime - 15min, endTime]
  let canCheckIn = false;
  if (isToday && isUpcoming && !hasAttendance && raw.startTime && raw.endTime) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const [sh, sm] = raw.startTime.split(":").map(Number);
    const [eh, em] = raw.endTime.split(":").map(Number);
    const startMinutes = sh * 60 + sm - 15; // Allow 15 min early
    const endMinutes = eh * 60 + em;

    canCheckIn = nowMinutes >= startMinutes && nowMinutes <= endMinutes;
  }

  return {
    id: String(raw.id),
    classId: String(raw.classId),
    className: raw.className ?? "",
    subject: raw.subjectName ?? raw.subject ?? "",
    teacherName: raw.teacherName ?? "",
    date: raw.date ?? "",
    startTime: raw.startTime ?? "",
    endTime: raw.endTime ?? "",
    room: raw.roomName ?? raw.room ?? "",
    status: raw.status ?? "upcoming",
    attendanceStatus: raw.attendanceStatus ?? null,
    canCheckIn,
  };
}

/** Get all sessions for a specific class */
export async function getClassSessions(classId: string): Promise<ClassSession[]> {
  const { data } = await apiClient.get("/sessions", {
    params: { classId },
  });
  const rawList = Array.isArray(data) ? data : [];
  return rawList.map(mapBackendSession);
}
