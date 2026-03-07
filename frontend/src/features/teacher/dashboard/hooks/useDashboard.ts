import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";

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
