import { apiClient } from "@/lib/api-client";
import type { TeacherSession, AttendeeRecord, SaveAttendanceDTO, AttendanceQueryParams } from "../types";

export async function getTeacherSessions(teacherId: number, params?: AttendanceQueryParams): Promise<TeacherSession[]> {
  const { data } = await apiClient.get("/schedule", { params: { teacherId, ...params } });
  return data;
}

export async function getSessionAttendance(sessionId: number, teacherId?: number): Promise<AttendeeRecord[]> {
  const { data } = await apiClient.get("/attendance", { params: { sessionId, teacherId } });
  return data;
}

export async function saveAttendance(teacherId: number, dto: SaveAttendanceDTO): Promise<void> {
  await apiClient.post("/attendance/bulk", {
    sessionId: dto.sessionId,
    attendances: dto.attendees,
    confirm: dto.confirm,
    teacherId,
  });
}

export async function getAttendanceStats(sessionId?: number): Promise<{ total: number; present: number; absent: number; late: number; rate: number }> {
  const { data } = await apiClient.get("/attendance/stats", { params: { sessionId } });
  return data;
}
