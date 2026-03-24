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
  const { data } = await apiClient.get("/attendance/roster", { params: { sessionId } });
  if (!Array.isArray(data)) return [];
  // Map BE AttendanceResponse → FE AttendeeRecord
  return data.map((r: any) => ({
    id: r.id,
    studentId: r.studentId != null ? String(r.studentId) : "",
    name: r.studentName ?? "",
    avatar: undefined,
    status: r.status?.toLowerCase() ?? "pending",  // BE may return uppercase
    checkinTime: r.checkInTime ?? null,
    method: r.method ?? null,
    absenceCount: 0, // will be enriched in future
  }));
}

export async function saveAttendance(_teacherId: number, dto: SaveAttendanceDTO): Promise<void> {
  await apiClient.post("/attendance/bulk", {
    sessionId: dto.sessionId,
    attendances: dto.attendees
      .filter((a) => a.status !== "pending") // BE không có status "pending"
      .map((a) => ({
        studentId: Number(a.studentId), // BE expects Long
        status: a.status,
        note: undefined,
      })),
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

// ── QR Token ──────────────────────────────────────────────────────────────────

export interface QrTokenResponse {
  token: string;
  expiresAt: string; // ISO instant
  expiryMinutes: number;
  sessionId: number;
}

/**
 * Teacher generate QR token cho session.
 * BE deactivate token cũ → tạo token mới.
 */
export async function generateQrToken(sessionId: number): Promise<QrTokenResponse> {
  const { data } = await apiClient.post("/attendance/qr/generate", null, {
    params: { sessionId },
  });
  return data;
}

/**
 * Lấy QR token đang active cho session (restore khi teacher quay lại trang).
 * Trả null nếu không có token active.
 */
export async function getActiveQrToken(sessionId: number): Promise<QrTokenResponse | null> {
  try {
    const { data, status } = await apiClient.get("/attendance/qr/active", {
      params: { sessionId },
    });
    if (status === 204 || !data) return null;
    return data;
  } catch {
    return null;
  }
}
