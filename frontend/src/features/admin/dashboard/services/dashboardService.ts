import { apiClient } from "@/lib/api-client";
import type { DashboardData } from "../types";
import {
  mockStats,
  mockRevenueData,
  mockTodaySchedule,
  mockTodayAttendance,
  mockAlerts,
  mockOverdueStudents,
} from "../data/mockData";

/**
 * Dashboard data — hybrid approach:
 * Thử gọi API trước, nếu lỗi thì fallback về mock data.
 * Khi BE có dedicated dashboard endpoint, sẽ chuyển hoàn toàn sang API.
 */
export async function getDashboardData(): Promise<DashboardData> {
  try {
    // Gọi nhiều API song song
    const [studentsRes, tuitionRes] = await Promise.allSettled([
      apiClient.get("/students/stats"),
      apiClient.get("/tuition/stats"),
    ]);

    // Merge real stats vào mock nếu API trả về thành công
    const stats = [...mockStats];
    if (studentsRes.status === "fulfilled" && studentsRes.value) {
      const s = studentsRes.value as any;
      if (s.total !== undefined) {
        stats[0] = { ...stats[0], value: String(s.total) };
      }
    }
    if (tuitionRes.status === "fulfilled" && tuitionRes.value) {
      const t = tuitionRes.value as any;
      if (t.totalRevenue !== undefined) {
        const revenueM = Math.round(t.totalRevenue / 1_000_000);
        stats[3] = { ...stats[3], value: `${revenueM}M` };
      }
    }

    return {
      stats,
      revenueData: mockRevenueData,
      todaySchedule: mockTodaySchedule,
      todayAttendance: mockTodayAttendance,
      alerts: mockAlerts,
      overdueStudents: mockOverdueStudents,
    };
  } catch {
    // Fallback hoàn toàn về mock data
    return {
      stats: mockStats,
      revenueData: mockRevenueData,
      todaySchedule: mockTodaySchedule,
      todayAttendance: mockTodayAttendance,
      alerts: mockAlerts,
      overdueStudents: mockOverdueStudents,
    };
  }
}

export async function getDashboardStats() {
  return getDashboardData();
}
