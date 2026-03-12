import { apiClient } from "@/lib/api-client";
import type { AttendanceRecord } from "../types";
import { MOCK_ATTENDANCE } from "../data/mockData";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export async function getMyAttendance(): Promise<AttendanceRecord[]> {
  try {
    const { data } = await apiClient.get("/attendance/stats");
    if (Array.isArray(data) && data.length > 0) return data;
  } catch { /* fallback */ }
  return clone(MOCK_ATTENDANCE);
}

export async function getAttendanceSummary(): Promise<{
  total: number; present: number; absent: number; late: number; rate: number;
}> {
  const records = await getMyAttendance();
  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT_UNEXCUSED" || r.status === "ABSENT_EXCUSED").length;
  const late = records.filter((r) => r.status === "LATE").length;
  return { total, present, absent, late, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
}

export async function checkIn(sessionId: string, studentId: number): Promise<void> {
  await apiClient.post("/attendance/check-in", null, {
    params: { sessionId, studentId },
  });
}
