import { apiClient } from "@/lib/api-client";
import type { AttendanceRecord, AttendanceStatus, AttendanceSummary, CheckInPayload } from "../types";

/** Get attendance records — backend resolves student from JWT via /attendance/me */
export async function getMyAttendance(classId?: string): Promise<AttendanceRecord[]> {
  const { data } = await apiClient.get("/attendance/me", {
    params: classId ? { classId } : undefined,
  });
  if (!Array.isArray(data)) return [];
  // Map BE AttendanceResponse → FE AttendanceRecord
  return data.map((r: any) => ({
    id: String(r.id ?? ""),
    sessionId: String(r.sessionId ?? ""),
    classId: "",
    className: r.className ?? "",
    date: r.sessionDate ?? "",
    sessionTime: r.sessionStartTime && r.sessionEndTime
      ? `${r.sessionStartTime} - ${r.sessionEndTime}` : "",
    status: mapStatus(r.status),
    isBillable: r.status !== "absent_excused",
    checkedInAt: r.checkInTime ?? undefined,
    note: r.note ?? undefined,
  }));
}

function mapStatus(beStatus: string): AttendanceStatus {
  const s = beStatus?.toLowerCase();
  if (s === "present") return "PRESENT";
  if (s === "late") return "LATE";
  if (s === "absent_excused") return "ABSENT_EXCUSED";
  return "ABSENT_UNEXCUSED";
}

/** Get attendance summary — reuse stats endpoint for student */
export async function getAttendanceSummary(): Promise<AttendanceSummary[]> {
  try {
    const { data } = await apiClient.get("/attendance/stats");
    // Backend returns single AttendanceStatsResponse — wrap it
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return [{
        classId: "",
        className: "Tất cả",
        totalSessions: data.totalSessions ?? 0,
        present: data.presentCount ?? 0,
        absentExcused: data.excusedCount ?? 0,
        absentUnexcused: data.absentCount ?? 0,
        late: data.lateCount ?? 0,
        attendanceRate: data.attendanceRate ?? 0,
      }];
    }
    return [];
  } catch {
    return [];
  }
}

/** QR Check-in — uses JWT-resolved /check-in/me endpoint */
export async function checkIn(payload: CheckInPayload): Promise<void> {
  await apiClient.post("/attendance/check-in/me", null, {
    params: { sessionId: payload.sessionId },
  });
}

/** QR Token Check-in — student validates QR token */
export async function qrTokenCheckIn(token: string): Promise<void> {
  await apiClient.post("/attendance/qr/check-in", null, {
    params: { token },
  });
}
