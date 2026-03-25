import { apiClient } from "@/lib/api-client";
import type { DashboardData } from "../types";

const defaultData: DashboardData = {
  stats: [
    { label: "Tổng học viên", value: "0", change: "", trend: "up" },
    { label: "Giáo viên", value: "0", change: "", trend: "up" },
    { label: "Lớp đang mở", value: "0", change: "", trend: "up" },
    { label: "Doanh thu tháng", value: "0đ", change: "", trend: "up" },
  ],
  revenueData: [
    { day: "T2", revenue: 0 },
    { day: "T3", revenue: 0 },
    { day: "T4", revenue: 0 },
    { day: "T5", revenue: 0 },
    { day: "T6", revenue: 0 },
    { day: "T7", revenue: 0 },
    { day: "CN", revenue: 0 },
  ],
  todaySchedule: [],
  todayAttendance: { total: 0, present: 0, absent: 0, late: 0 },
  alerts: [],
  overdueStudents: [],
};

/**
 * Dashboard data — gọi 1 API aggregate duy nhất.
 * Returns safe defaults khi BE unavailable.
 */
export async function getDashboardData(): Promise<DashboardData> {
  try {
    const { data } = await apiClient.get("/dashboard");
    return {
      stats: data?.stats ?? defaultData.stats,
      revenueData: data?.revenueData ?? defaultData.revenueData,
      todaySchedule: data?.todaySchedule ?? defaultData.todaySchedule,
      todayAttendance: data?.todayAttendance ?? defaultData.todayAttendance,
      alerts: data?.alerts ?? defaultData.alerts,
      overdueStudents: data?.overdueStudents ?? defaultData.overdueStudents,
    };
  } catch {
    return defaultData;
  }
}

export async function getDashboardStats() {
  return getDashboardData();
}
