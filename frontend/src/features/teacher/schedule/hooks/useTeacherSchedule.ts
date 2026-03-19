import { useQuery } from "@tanstack/react-query";
import { getMyTeacherSchedule } from "../services/teacherScheduleService";

/**
 * Hook lấy lịch dạy của giáo viên đang đăng nhập.
 * Gọi GET /api/v1/schedule/teacher/me — backend tự resolve teacherId từ JWT.
 * Không cần truyền teacherId từ Frontend, tránh hoàn toàn bug lịch lẫn lộn giữa các teacher.
 */
export function useTeacherSchedule(weekStart?: string) {
  return useQuery({
    queryKey: ["teacherSchedule", "me", weekStart ?? "current"],
    queryFn: () => getMyTeacherSchedule(weekStart),
  });
}
