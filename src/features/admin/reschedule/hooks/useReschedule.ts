import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getRequests, getStats, approveRequest, rejectRequest } from "../services";

// ─── Query keys ───────────────────────────────────────────────────────────────

const rescheduleKeys = {
  all: ["reschedule"] as const,
  list: () => [...rescheduleKeys.all, "list"] as const,
  stats: () => [...rescheduleKeys.all, "stats"] as const,
};

// ─── Query hooks ──────────────────────────────────────────────────────────────

export function useRequests() {
  return useQuery({
    queryKey: rescheduleKeys.list(),
    queryFn: getRequests,
  });
}

export function useRescheduleStats() {
  return useQuery({
    queryKey: rescheduleKeys.stats(),
    queryFn: getStats,
  });
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

export function useApproveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rescheduleKeys.all });
      toast.success("Đã duyệt yêu cầu thành công");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectRequest(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rescheduleKeys.all });
      toast.info("Đã từ chối yêu cầu");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
