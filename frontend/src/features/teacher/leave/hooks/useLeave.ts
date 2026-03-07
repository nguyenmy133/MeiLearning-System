import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/features/shared/auth/authService";
import type { LeaveQueryParams, ReviewLeaveDTO } from "../types";
import { getLeaveRequests, getLeaveStats, approveLeaveRequest, rejectLeaveRequest } from "../services";

const teacherId = () => authService.getCurrentTeacherId();

export const leaveKeys = {
    all: ["teacher-leave"] as const,
    lists: (params?: LeaveQueryParams) => [...leaveKeys.all, "list", params] as const,
    stats: () => [...leaveKeys.all, "stats"] as const,
};

export function useLeaveRequests(params?: LeaveQueryParams) {
    return useQuery({
        queryKey: leaveKeys.lists(params),
        queryFn: () => getLeaveRequests(teacherId(), params),
    });
}

export function useLeaveStats() {
    return useQuery({
        queryKey: leaveKeys.stats(),
        queryFn: () => getLeaveStats(teacherId()),
    });
}

export function useApproveLeave() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => approveLeaveRequest(id, teacherId()),
        onSuccess: (req) => {
            qc.invalidateQueries({ queryKey: leaveKeys.all });
            toast.success(`Đã duyệt đơn của ${req.studentName}`);
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

export function useRejectLeave() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: ReviewLeaveDTO }) =>
            rejectLeaveRequest(id, teacherId(), dto),
        onSuccess: (req) => {
            qc.invalidateQueries({ queryKey: leaveKeys.all });
            toast.success(`Đã từ chối đơn của ${req.studentName}`);
        },
        onError: (err: Error) => toast.error(err.message),
    });
}
