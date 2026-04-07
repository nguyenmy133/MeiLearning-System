import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/shared/auth/auth-context";
import { getRequests, getStats, approveRequest, rejectRequest } from "../services";
import type { RescheduleRequest } from "../types";

// ─── Query keys ───────────────────────────────────────────────────────────────

const rescheduleKeys = {
  all: ["reschedule"] as const,
  list: () => [...rescheduleKeys.all, "list"] as const,
  stats: () => [...rescheduleKeys.all, "stats"] as const,
};

// ─── Query hooks ──────────────────────────────────────────────────────────────

export function useRequests(queryParams?: any) {
  return useQuery({
    queryKey: [...rescheduleKeys.list(), queryParams],
    queryFn: () => getRequests(queryParams),
  });
}

export function useRescheduleStats() {
  return useQuery({
    queryKey: rescheduleKeys.stats(),
    queryFn: () => getStats(),
  });
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

export function useApproveRequest() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const reviewedBy = user?.name ?? "admin";

  return useMutation({
    mutationFn: (id: string) => approveRequest(id, reviewedBy),
    onSuccess: (updatedReq) => {
      const req = updatedReq as RescheduleRequest;
      qc.invalidateQueries({ queryKey: rescheduleKeys.all });
      // Lịch học có thể thay đổi sau khi duyệt ≃ invalidate schedule cache
      qc.invalidateQueries({ queryKey: ["schedule"] });
      toast.success(
        `Đã duyệt yêu cầu của ${req.teacherName ?? "giáo viên"} — lớp ${req.className ?? ""}`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const reviewedBy = user?.name ?? "admin";

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectRequest(id, reviewedBy, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rescheduleKeys.all });
      toast.info("Đã từ chối yêu cầu");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
