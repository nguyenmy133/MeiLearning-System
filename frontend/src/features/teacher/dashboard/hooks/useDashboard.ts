import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";
import { getTeacherExams } from "@/features/teacher/exam/services/examService";
import { getAttendanceStats, getSessionAttendance } from "@/features/teacher/attendance/services/attendanceService";
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

/**
 * Attendance stats cho hôm nay (total, present, absent, late, rate)
 * Gợi ý từ Senior: Thay vì gọi /attendance/stats (trả về toàn hệ thống), 
 * ta fetch roster của các class trong ngày để tổng hợp.
 */
export const useTodayAttendanceStats = (sessionIds: number[]) => {
    return useQuery({
        queryKey: ["teacher", "dashboard", "attendance-stats-today", sessionIds],
        queryFn: async () => {
            if (!sessionIds || sessionIds.length === 0) {
                return { total: 0, present: 0, absent: 0, late: 0, rate: 0 };
            }
            
            // Lấy roster (danh sách học viên + điểm danh) của các session hôm nay
            const rosters = await Promise.all(
                sessionIds.map(id => getSessionAttendance(id))
            );
            
            const allRecords = rosters.flat();
            const total = allRecords.length;
            let present = 0, absent = 0, late = 0;
            
            allRecords.forEach(r => {
                if (r.status === "present") present++;
                else if (r.status === "absent" || r.status === "absent_excused") absent++;
                else if (r.status === "late") late++;
            });
            
            const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
            
            return { total, present, absent, late, rate };
        },
        enabled: sessionIds !== undefined,
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
