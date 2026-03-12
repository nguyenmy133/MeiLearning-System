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
  const { data } = await apiClient.get("/attendance/stats", { params });
  return data;
}

export async function qrCheckIn(sessionId: number, studentId: number) {
  const { data } = await apiClient.post(API.ATTENDANCE.CHECK_IN, null, {
    params: { sessionId, studentId },
  });
  return data;
}

// ── Functions expected by hooks ───────────────────────────────────────────────

export async function getAttendanceSessions(params?: any) {
  const { data } = await apiClient.get("/attendance/sessions", { params });
  return data;
}

export async function getLiveSessions() {
  const { data } = await apiClient.get("/attendance/sessions", { params: { status: "live" } });
  return data;
}

export async function getAbsentAlerts() {
  const { data } = await apiClient.get("/attendance/alerts");
  return data;
}

export async function toggleQR(sessionId: number, activatedBy: string) {
  const { data } = await apiClient.post(`/attendance/sessions/${sessionId}/toggle-qr`, { activatedBy });
  return data;
}

export async function getSessionRecords(sessionId: number) {
  const { data } = await apiClient.get(`/attendance/sessions/${sessionId}/records`);
  return data;
}

export async function updateAttendanceRecord(recordId: number, status: string, note?: string) {
  const { data } = await apiClient.patch(`/attendance/records/${recordId}`, { status, note });
  return data;
}
