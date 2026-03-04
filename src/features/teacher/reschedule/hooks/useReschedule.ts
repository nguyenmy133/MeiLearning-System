import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/features/shared/auth/authService";
import type { CreateRescheduleDTO, RescheduleQueryParams } from "../types";
import { getRescheduleRequests, createRescheduleRequest } from "../services";

const teacherId = () => authService.getCurrentTeacherId();

export const rescheduleKeys = {
    all: ["teacher-reschedule"] as const,
    lists: (params?: RescheduleQueryParams) => [...rescheduleKeys.all, "list", params] as const,
};

export function useRescheduleRequests(params?: RescheduleQueryParams) {
    return useQuery({
        queryKey: rescheduleKeys.lists(params),
        queryFn: () => getRescheduleRequests(teacherId(), params),
    });
}

export function useCreateReschedule() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateRescheduleDTO) => createRescheduleRequest(teacherId(), dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: rescheduleKeys.all });
            toast.success("Đã gửi yêu cầu đổi lịch thành công");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}
