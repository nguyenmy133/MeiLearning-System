import { apiClient } from "@/lib/api-client";
import type { ClassInfo, ClassSession } from "../types";
import { MOCK_CLASSES, MOCK_SESSIONS } from "../data/mockData";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

/** Get student's enrolled classes */
export async function getMyClasses(): Promise<ClassInfo[]> {
  try {
    const { data } = await apiClient.get("/classes", { params: { enrolled: true } });
    if (Array.isArray(data) && data.length > 0) return data;
  } catch { /* fallback */ }
  return clone(MOCK_CLASSES);
}

/** Get schedule sessions for a date range */
export async function getMySchedule(startDate?: string, endDate?: string): Promise<ClassSession[]> {
  try {
    const { data } = await apiClient.get("/schedule", {
      params: { view: "week", startDate, endDate },
    });
    if (Array.isArray(data) && data.length > 0) return data;
  } catch { /* fallback */ }
  let sessions = clone(MOCK_SESSIONS);
  if (startDate) sessions = sessions.filter((s) => s.date >= startDate);
  if (endDate) sessions = sessions.filter((s) => s.date <= endDate);
  return sessions;
}

/** Get today's sessions */
export async function getTodaySessions(): Promise<ClassSession[]> {
  const today = new Date().toISOString().split("T")[0];
  try {
    const { data } = await apiClient.get("/schedule", {
      params: { view: "day", date: today },
    });
    if (Array.isArray(data) && data.length > 0) return data;
  } catch { /* fallback */ }
  return clone(MOCK_SESSIONS).filter((s) => s.date === today);
}

// Keep backward-compatible named export
export async function getStudentSchedule(studentId: number, params?: { date?: string; view?: string }) {
  return getMySchedule();
}
