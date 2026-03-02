import { DashboardData } from "../types";
import {
  mockStats,
  mockRevenueData,
  mockTodaySchedule,
  mockTodayAttendance,
  mockAlerts,
  mockOverdueStudents,
} from "../data/mockData";

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function randomDelay(min = 300, max = 700): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
  );
}

export async function getDashboardData(): Promise<DashboardData> {
  await randomDelay();
  return {
    stats: clone(mockStats),
    revenueData: clone(mockRevenueData),
    todaySchedule: clone(mockTodaySchedule),
    todayAttendance: clone(mockTodayAttendance),
    alerts: clone(mockAlerts),
    overdueStudents: clone(mockOverdueStudents),
  };
}
