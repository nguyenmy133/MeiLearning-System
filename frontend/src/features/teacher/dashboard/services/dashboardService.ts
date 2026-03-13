import { apiClient } from "@/lib/api-client";
import { authService } from "@/features/shared/auth/authService";
import type { PendingTask } from "../types";
import { MOCK_PENDING_TASKS, MOCK_ATTENDANCE_RATE } from "../data/mockData";

/**
 * Teacher Dashboard Service — hybrid approach.
 * Gọi real API, fallback mock khi BE chưa có dedicated endpoint.
 */
export const dashboardService = {
  async getPendingTasks(): Promise<PendingTask[]> {
    // BE chưa có dedicated pending-tasks endpoint → dùng mock
    // Khi BE có /api/v1/teachers/{id}/pending-tasks, sẽ chuyển sang API
    return MOCK_PENDING_TASKS;
  },

  async getAttendanceRate(): Promise<number> {
    try {
      const teacherId = authService.getCurrentTeacherId();
      const { data } = await apiClient.get("/attendance/stats", {
        params: { teacherId },
      });
      if (data?.attendanceRate !== undefined) return data.attendanceRate;
    } catch { /* fallback */ }
    return MOCK_ATTENDANCE_RATE;
  },

  async getTeacherStats() {
    try {
      const teacherId = authService.getCurrentTeacherId();
      const [classesRes, examsRes] = await Promise.allSettled([
        apiClient.get("/classes", { params: { teacherId, limit: 1 } }),
        apiClient.get("/exams", { params: { teacherId, status: "draft" } }),
      ]);

      return {
        pendingTasks: MOCK_PENDING_TASKS,
        attendanceRate: MOCK_ATTENDANCE_RATE,
        totalClasses:
          classesRes.status === "fulfilled"
            ? classesRes.value.data?.totalElements ?? 0
            : 0,
        pendingExams:
          examsRes.status === "fulfilled"
            ? Array.isArray(examsRes.value.data) ? examsRes.value.data.length : 0
            : 0,
      };
    } catch {
      return {
        pendingTasks: MOCK_PENDING_TASKS,
        attendanceRate: MOCK_ATTENDANCE_RATE,
        totalClasses: 0,
        pendingExams: 0,
      };
    }
  },
};

// Also export for direct usage
export function getTeacherDashboard(teacherId: number) {
  return dashboardService.getTeacherStats();
}
