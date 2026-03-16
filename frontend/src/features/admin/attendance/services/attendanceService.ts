import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";

export async function getAttendanceBySession(sessionId: number) {
  const { data } = await apiClient.get(API.ATTENDANCE.LIST, { params: { sessionId } });
  return data;
}

export async function bulkAttendance(sessionId: number, attendances: Array<{ studentId: number; status: string; note?: string }>) {
  const { data } = await apiClient.post("/attendance/bulk", { sessionId, attendances });
  return data;
}

export async function getAttendanceStats(params?: { classId?: number; month?: string }) {
  try {
    const { data } = await apiClient.get("/attendance/stats", { params });
    // Backend returns: { totalSessions, presentCount, absentCount, lateCount, excusedCount, attendanceRate }
    // Frontend expects: { totalStudents, averageRate, totalLate, alertCount }
    return {
      totalStudents: data?.totalSessions ?? 0,
      averageRate: data?.attendanceRate != null ? Math.round(data.attendanceRate) : 0,
      totalLate: data?.lateCount ?? 0,
      alertCount: data?.absentCount ?? 0,
      totalRecords: data?.totalSessions ?? 0,
      totalPresent: data?.presentCount ?? 0,
      totalAbsent: data?.absentCount ?? 0,
    };
  } catch {
    // Backend attendance/stats may fail if no data — return safe defaults
    return {
      totalStudents: 0,
      averageRate: 0,
      totalLate: 0,
      alertCount: 0,
      totalRecords: 0,
      totalPresent: 0,
      totalAbsent: 0,
    };
  }
}

export async function qrCheckIn(sessionId: number, studentId: number) {
  const { data } = await apiClient.post(API.ATTENDANCE.CHECK_IN, null, {
    params: { sessionId, studentId },
  });
  return data;
}

// ── Functions expected by hooks ───────────────────────────────────────────────
// These endpoints don't exist on backend yet — return empty arrays gracefully

export async function getAttendanceSessions(params?: any) {
  try {
    const { data } = await apiClient.get("/attendance/sessions", { params });
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch {
    // Endpoint not implemented yet
    return [];
  }
}

export async function getLiveSessions() {
  try {
    const { data } = await apiClient.get("/attendance/sessions", { params: { status: "live" } });
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch {
    // Endpoint not implemented yet
    return [];
  }
}

export async function getAbsentAlerts() {
  try {
    const { data } = await apiClient.get("/attendance/alerts");
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch {
    // Endpoint not implemented yet
    return [];
  }
}

export async function toggleQR(sessionId: number, activatedBy: string) {
  const { data } = await apiClient.post(`/attendance/sessions/${sessionId}/toggle-qr`, { activatedBy });
  return data;
}

export async function getSessionRecords(sessionId: number) {
  try {
    const { data } = await apiClient.get(`/attendance/sessions/${sessionId}/records`);
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch {
    return [];
  }
}

export async function updateAttendanceRecord(recordId: number, status: string, note?: string) {
  const { data } = await apiClient.patch(`/attendance/records/${recordId}`, { status, note });
  return data;
}
