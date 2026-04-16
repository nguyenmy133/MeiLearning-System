import { apiClient } from "@/lib/api-client";
import { ClipboardList, AlertCircle, Calendar } from "lucide-react";
import type { PendingTask } from "../types";

/** Map backend PendingTaskResponse → frontend PendingTask */
function mapTask(t: any, index: number): PendingTask {
  const typeIconMap: Record<string, any> = {
    leave: AlertCircle,
    late: AlertCircle,
    attendance: Calendar,
    exam: ClipboardList,
  };
  const typeClassMap: Record<string, string> = {
    leave: "bg-amber-100 text-amber-700",
    late: "bg-orange-100 text-orange-700",
    attendance: "bg-blue-100 text-blue-700",
    exam: "bg-purple-100 text-purple-700",
  };
  const typeLinkMap: Record<string, string> = {
    leave: "/teacher/leave-approval",
    late: "/teacher/leave-approval",
    attendance: "/teacher/attendance",
    exam: "/teacher/exams",
  };

  return {
    id: index,
    type: (t.type === "leave" ? "leave" : t.type === "late" ? "late" : t.type === "exam" ? "exam" : "absent") as PendingTask["type"],
    label: t.title ?? "",
    sub: t.description ?? "",
    href: typeLinkMap[t.type] ?? "/teacher",
    icon: typeIconMap[t.type] ?? ClipboardList,
    badgeClass: typeClassMap[t.type] ?? "bg-gray-100 text-gray-700",
    urgent: t.urgent ?? false,
  };
}

/**
 * Teacher Dashboard Service.
 * Gọi real API — backend resolve teacher từ JWT.
 */
export const dashboardService = {
  /**
   * Lấy danh sách pending tasks thực từ backend.
   * GET /api/v1/teachers/me/pending-tasks
   */
  async getPendingTasks(): Promise<PendingTask[]> {
    try {
      const { data } = await apiClient.get("/teachers/me/pending-tasks");
      if (!Array.isArray(data)) return [];
      return data.map(mapTask);
    } catch {
      return [];
    }
  },

  /**
   * Tỷ lệ điểm danh của teacher.
   * GET /api/v1/attendance/stats
   */
  async getAttendanceRate(): Promise<number> {
    try {
      const { data } = await apiClient.get("/attendance/stats");
      if (data?.attendanceRate !== undefined) return data.attendanceRate;
    } catch { /* fallback */ }
    return 0;
  },
};

export function getTeacherDashboard() {
  return dashboardService.getPendingTasks();
}
