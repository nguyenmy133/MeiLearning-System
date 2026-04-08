import { apiClient } from "@/lib/api-client";

export async function getReportsOverview() {
  const { data } = await apiClient.get("/reports/overview");
  return data;
}

export async function getAttendanceReport(params?: { classId?: number; month?: string }) {
  const { data } = await apiClient.get("/attendance/stats", { params });
  return data;
}

export async function getTuitionReport(params?: { month?: string }) {
  const { data } = await apiClient.get("/tuition/stats", { params });
  return data;
}

// ── Functions expected by hooks ───────────────────────────────────────────────

export async function getFinancialReport() {
  const { data } = await apiClient.get("/reports/tuition");
  return data;
}

export async function getAcademicReport() {
  const { data } = await apiClient.get("/reports/attendance");
  return data;
}
