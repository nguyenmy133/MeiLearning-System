import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateLeaveRequestDTO, LeaveQueryParams } from "../types";
import {
    getMyLeaveRequests,
    createLeaveRequest,
    cancelLeaveRequest,
} from "../services";

export const leaveKeys = {
    all: ["user-leave"] as const,
    lists: (params?: LeaveQueryParams) => [...leaveKeys.all, "list", params] as const,
};

export function useMyLeaveRequests(params?: LeaveQueryParams) {
    return useQuery({
        queryKey: leaveKeys.lists(params),
        queryFn: () => getMyLeaveRequests(params),
    });
}

export function useCreateLeaveRequest() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateLeaveRequestDTO) => createLeaveRequest(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: leaveKeys.all });
            toast.success("Đã gửi đơn xin nghỉ thành công. Vui lòng chờ Giáo viên duyệt.");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

export function useCancelLeaveRequest() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => cancelLeaveRequest(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: leaveKeys.all });
            toast.success("Đã huỷ đơn xin nghỉ.");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}
