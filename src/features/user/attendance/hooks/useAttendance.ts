import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CheckInPayload } from "../types";
import { getMyAttendance, getAttendanceSummary, checkIn } from "../services";

export const attendanceKeys = {
    all: ["user-attendance"] as const,
    list: (classId?: string) => [...attendanceKeys.all, "list", classId] as const,
    summary: () => [...attendanceKeys.all, "summary"] as const,
};

export function useMyAttendance(classId?: string) {
    return useQuery({
        queryKey: attendanceKeys.list(classId),
        queryFn: () => getMyAttendance(classId),
    });
}

export function useAttendanceSummary() {
    return useQuery({
        queryKey: attendanceKeys.summary(),
        queryFn: () => getAttendanceSummary(),
    });
}

export function useCheckIn() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CheckInPayload) => checkIn(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: attendanceKeys.all });
            toast.success("Điểm danh thành công! 🎉");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}
