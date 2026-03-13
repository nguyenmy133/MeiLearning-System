import { apiClient } from "@/lib/api-client";
import type { DashboardData, DashboardStatData } from "../types";
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
 * Gọi tất cả BE stats APIs, merge vào dashboard.
 * Fallback mock data cho các phần BE chưa hỗ trợ (schedule, alerts).
 */
export async function getDashboardData(): Promise<DashboardData> {
  try {
    // Gọi nhiều API song song
    const [studentsRes, teachersRes, classesRes, tuitionRes, attendanceRes] =
      await Promise.allSettled([
        apiClient.get("/students/stats"),
        apiClient.get("/teachers/stats"),
        apiClient.get("/classes/stats"),
        apiClient.get("/tuition/stats"),
        apiClient.get("/attendance/stats"),
      ]);

    // Build stats từ real data, fallback mock nếu API lỗi
    const stats: DashboardStatData[] = [...mockStats];

    if (studentsRes.status === "fulfilled") {
      const s = studentsRes.value.data;
      if (s?.total !== undefined) {
        stats[0] = { ...stats[0], value: String(s.total) };
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
        const revenueM = Math.round(t.totalRevenue / 1_000_000);
        stats[3] = { ...stats[3], value: `${revenueM}M` };
      }
    }

    // Attendance — map to TodayAttendance if API returns data
    let todayAttendance = mockTodayAttendance;
    if (attendanceRes.status === "fulfilled") {
      const a = attendanceRes.value.data;
      if (a?.totalPresent !== undefined) {
        todayAttendance = {
          total: a.totalRecords ?? mockTodayAttendance.total,
          present: a.totalPresent ?? mockTodayAttendance.present,
          absent: a.totalAbsent ?? mockTodayAttendance.absent,
          late: a.totalLate ?? mockTodayAttendance.late,
        };
      }
    }

    return {
      stats,
      revenueData: mockRevenueData,     // TODO: add revenue chart API
      todaySchedule: mockTodaySchedule,  // TODO: add today schedule API
      todayAttendance,
      alerts: mockAlerts,                // TODO: add alerts API
      overdueStudents: mockOverdueStudents, // TODO: add overdue tuition API
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
