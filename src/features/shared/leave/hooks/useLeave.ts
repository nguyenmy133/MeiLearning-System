import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateLeaveDTO, LeaveQueryParams } from "../types";
import {
  getLeaveRequests,
  getLeaveStats,
  createLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "../services/leaveService";

// ── Query key factory ─────────────────────────────────────────────────────────
export const leaveKeys = {
  all: ["leave"] as const,
  list: (params?: LeaveQueryParams) => [...leaveKeys.all, "list", params] as const,
  stats: (params?: object) => [...leaveKeys.all, "stats", params] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useLeaveRequests(params?: LeaveQueryParams) {
  return useQuery({
    queryKey: leaveKeys.list(params),
    queryFn: () => getLeaveRequests(params),
  });
}

export function useLeaveStats(
  params?: Parameters<typeof getLeaveStats>[0]
) {
  return useQuery({
    queryKey: leaveKeys.stats(params),
    queryFn: () => getLeaveStats(params),
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLeaveDTO) => createLeaveRequest(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leaveKeys.all });
      toast.success("Đã gửi đơn xin nghỉ thành công");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useApproveLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewedBy }: { id: string; reviewedBy: string }) =>
      approveLeaveRequest(id, reviewedBy),
    onSuccess: (req) => {
      qc.invalidateQueries({ queryKey: leaveKeys.all });
      toast.success(`Đã duyệt đơn của ${req.requesterName}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRejectLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reviewedBy,
      rejectReason,
    }: {
      id: string;
      reviewedBy: string;
      rejectReason: string;
    }) => rejectLeaveRequest(id, reviewedBy, rejectReason),
    onSuccess: (req) => {
      qc.invalidateQueries({ queryKey: leaveKeys.all });
      toast.info(`Đã từ chối đơn của ${req.requesterName}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
