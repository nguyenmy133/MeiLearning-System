import { apiClient } from "@/lib/api-client";
import type {
  AttendeeRecord,
  SaveAttendanceDTO,
  AttendanceQueryParams,
} from "../types";
import type { ScheduledSession } from "@/features/admin/schedule/types";

/**
 * Lấy danh sách buổi dạy của teacher đang đăng nhập.
 * Gọi GET /api/v1/attendance/sessions/teacher/me?date=YYYY-MM-DD
 * Backend tự resolve teacherId từ JWT — không cần truyền ID.
 */
export async function getMyTeacherSessions(
  date?: string,
  params?: AttendanceQueryParams
): Promise<ScheduledSession[]> {
  const { data } = await apiClient.get("/attendance/sessions/teacher/me", {
    params: { date, ...params },
  });
  if (!Array.isArray(data)) return [];
  return data.map((s: any) => ({
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
}

export async function getSessionAttendance(
  sessionId: number
): Promise<AttendeeRecord[]> {
  const { data } = await apiClient.get("/attendance", { params: { sessionId } });
  return Array.isArray(data) ? data : [];
}

export async function saveAttendance(_teacherId: number, dto: SaveAttendanceDTO): Promise<void> {
  await apiClient.post("/attendance/bulk", {
    sessionId: dto.sessionId,
    attendances: dto.attendees,
    confirm: dto.confirm,
  });
}

export async function getAttendanceStats(
  sessionId?: number
): Promise<{ total: number; present: number; absent: number; late: number; rate: number }> {
  const { data } = await apiClient.get("/attendance/stats", {
    params: { sessionId },
  });
  return data ?? { total: 0, present: 0, absent: 0, late: 0, rate: 0 };
}
