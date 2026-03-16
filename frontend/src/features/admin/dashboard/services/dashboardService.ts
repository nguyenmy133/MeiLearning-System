import { apiClient } from "@/lib/api-client";
import type { DashboardData, DashboardStatData, DailyRevenue } from "../types";

const defaultStats: DashboardStatData[] = [
  { label: "Tổng học viên", value: "0", change: "", trend: "up" },
  { label: "Giáo viên", value: "0", change: "", trend: "up" },
  { label: "Lớp đang mở", value: "0", change: "", trend: "up" },
  { label: "Doanh thu tháng", value: "0đ", change: "", trend: "up" },
];

const defaultRevenueData: DailyRevenue[] = [
  { day: "T2", revenue: 0 },
  { day: "T3", revenue: 0 },
  { day: "T4", revenue: 0 },
  { day: "T5", revenue: 0 },
  { day: "T6", revenue: 0 },
  { day: "T7", revenue: 0 },
  { day: "CN", revenue: 0 },
];

/**
 * Dashboard data — calls all backend stats APIs.
 * Returns safe defaults when BE is unavailable.
 */
export async function getDashboardData(): Promise<DashboardData> {
  try {
    const [studentsRes, teachersRes, classesRes, tuitionRes, attendanceRes] =
      await Promise.allSettled([
        apiClient.get("/students/stats"),
        apiClient.get("/teachers/stats"),
        apiClient.get("/classes/stats"),
        apiClient.get("/tuition/stats"),
        apiClient.get("/attendance/stats"),
      ]);

    const stats: DashboardStatData[] = [...defaultStats];

    if (studentsRes.status === "fulfilled") {
      const s = studentsRes.value.data;
      if (s?.totalStudents !== undefined) {
        stats[0] = { ...stats[0], value: String(s.totalStudents) };
      }
    }
    if (teachersRes.status === "fulfilled") {
      const t = teachersRes.value.data;
      if (t?.totalTeachers !== undefined) {
        stats[1] = { ...stats[1], value: String(t.totalTeachers) };
      }
    }
    if (classesRes.status === "fulfilled") {
      const c = classesRes.value.data;
      if (c?.activeClasses !== undefined) {
        stats[2] = { ...stats[2], value: String(c.activeClasses) };
      }
    }
    if (tuitionRes.status === "fulfilled") {
      const t = tuitionRes.value.data;
      if (t?.totalRevenue !== undefined) {
        const revenue = t.totalRevenue;
        const display = revenue >= 1_000_000 
          ? `${Math.round(revenue / 1_000_000)}M`
          : revenue > 0 
            ? new Intl.NumberFormat("vi-VN").format(revenue) + "đ"
            : "0đ";
        stats[3] = { ...stats[3], value: display };
      }
    }

    let todayAttendance = { total: 0, present: 0, absent: 0, late: 0 };
    if (attendanceRes.status === "fulfilled") {
      const a = attendanceRes.value.data;
      todayAttendance = {
        total: a?.totalSessions ?? 0,
        present: a?.presentCount ?? 0,
        absent: a?.absentCount ?? 0,
        late: a?.lateCount ?? 0,
      };
    }

    return {
      stats,
      revenueData: defaultRevenueData,
      todaySchedule: [],
      todayAttendance,
      alerts: [],
      overdueStudents: [],
    };
  } catch {
    return {
      stats: defaultStats,
      revenueData: defaultRevenueData,
      todaySchedule: [],
      todayAttendance: { total: 0, present: 0, absent: 0, late: 0 },
      alerts: [],
      overdueStudents: [],
    };
  }
}

export async function getDashboardStats() {
  return getDashboardData();
}
