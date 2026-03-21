import { apiClient } from "@/lib/api-client";
import type { AttendanceRecord, AttendanceSummary, CheckInPayload } from "../types";

/** Get attendance records — backend resolves student from JWT */
export async function getMyAttendance(classId?: string): Promise<AttendanceRecord[]> {
  const { data } = await apiClient.get("/attendance/stats", {
    params: classId ? { classId } : undefined,
  });
  // Backend returns AttendanceStatsResponse — may need mapping
  if (Array.isArray(data)) return data;
  // If backend returns an object with records array, extract it
  if (data?.records && Array.isArray(data.records)) return data.records;
  return [];
}

/** Get attendance summary — backend resolves student from JWT */
export async function getAttendanceSummary(): Promise<AttendanceSummary[]> {
  const { data } = await apiClient.get("/attendance/stats");
  // Backend returns AttendanceStatsResponse — extract summary if present
  if (Array.isArray(data)) return data;
  // If backend returns a single stats object, wrap into array
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return [data as AttendanceSummary];
  }
  return [];
}

/** QR Check-in — uses JWT-resolved /check-in/me endpoint */
export async function checkIn(payload: CheckInPayload): Promise<void> {
  await apiClient.post("/attendance/check-in/me", null, {
    params: { sessionId: payload.sessionId },
  });
}
