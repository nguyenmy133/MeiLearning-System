import type { PendingTask } from "../types";
import { MOCK_PENDING_TASKS, MOCK_ATTENDANCE_RATE } from "../data/mockData";

/**
 * Teacher Dashboard Service — hybrid approach.
 * Trả mock data trước, sẽ replace bằng real API khi BE có endpoint riêng.
 */
export const dashboardService = {
  async getPendingTasks(): Promise<PendingTask[]> {
    // TODO: Replace with real API call when BE has teacher dashboard endpoint
    return MOCK_PENDING_TASKS;
  },

  async getAttendanceRate(): Promise<number> {
    // TODO: Replace with real API call
    return MOCK_ATTENDANCE_RATE;
  },
};

// Also export for direct usage
export function getTeacherDashboard(teacherId: number) {
  return dashboardService.getPendingTasks();
}
