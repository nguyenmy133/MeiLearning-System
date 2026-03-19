import { apiClient } from "@/lib/api-client";
import type { ScheduledSession } from "@/features/admin/schedule/types";

/**
 * Lấy lịch dạy của giáo viên đang đăng nhập.
 * Gọi endpoint: GET /api/v1/schedule/teacher/me?date=...&view=week
 * Backend tự resolve teacherId từ JWT token — không cần Frontend truyền ID.
 */
export async function getMyTeacherSchedule(
  weekStart?: string
): Promise<ScheduledSession[]> {
  try {
    const { data } = await apiClient.get("/schedule/teacher/me", {
      params: { view: "week", date: weekStart },
    });

    const rawSessions = data?.sessions ?? [];
    return rawSessions.map((s: any) => ({
      id: s.id,
      classId: s.classId,
      className: s.className ?? "",
      teacherId: 0, // not needed on FE
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
