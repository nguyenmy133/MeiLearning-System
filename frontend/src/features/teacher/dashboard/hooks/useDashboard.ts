import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";
import { getTeacherExams } from "@/features/teacher/exam/services/examService";
import { getAttendanceStats } from "@/features/teacher/attendance/services/attendanceService";
import { notificationService } from "@/features/user/notifications/services/notificationService";

export const usePendingTasks = () => {
    return useQuery({
        queryKey: ["teacher", "dashboard", "pending-tasks"],
        queryFn: () => dashboardService.getPendingTasks(),
    });
};

export const useAttendanceRate = () => {
    return useQuery({
        queryKey: ["teacher", "dashboard", "attendance-rate"],
        queryFn: () => dashboardService.getAttendanceRate(),
    });
};

/** Attendance stats cho hôm nay (total, present, absent, late, rate) */
export const useTodayAttendanceStats = () => {
    return useQuery({
        queryKey: ["teacher", "dashboard", "attendance-stats-today"],
        queryFn: () => getAttendanceStats(),
    });
};

/** Danh sách bài thi của teacher (dùng cho Exam Summary + Stat Card) */
export const useTeacherExamsForDashboard = () => {
    return useQuery({
        queryKey: ["teacher", "dashboard", "exams"],
        queryFn: () => getTeacherExams(),
        staleTime: 2 * 60 * 1000, // cache 2 min
    });
};

/** Thông báo gần đây (5 cái mới nhất) */
export const useRecentNotifications = () => {
    return useQuery({
        queryKey: ["teacher", "dashboard", "recent-notifications"],
        queryFn: async () => {
            const all = await notificationService.getNotifications();
            return all.slice(0, 5); // lấy 5 cái mới nhất
        },
        staleTime: 60 * 1000,
    });
};
