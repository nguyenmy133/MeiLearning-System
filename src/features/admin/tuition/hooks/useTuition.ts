import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TuitionQueryParams } from "../types";
import {
  getInvoices,
  getTuitionStats,
  approveInvoice,
  confirmCashPayment,
} from "../services";

// ── Query key factory ─────────────────────────────────────────────────────────
export const tuitionKeys = {
  all: ["tuition"] as const,
  invoices: () => [...tuitionKeys.all, "invoices"] as const,
  invoiceList: (params?: TuitionQueryParams) =>
    [...tuitionKeys.invoices(), params] as const,
  stats: () => [...tuitionKeys.all, "stats"] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useInvoices(params?: TuitionQueryParams) {
  return useQuery({
    queryKey: tuitionKeys.invoiceList(params),
    queryFn: () => getInvoices(params),
  });
}

export function useTuitionStats() {
  return useQuery({
    queryKey: tuitionKeys.stats(),
    queryFn: () => getTuitionStats(),
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useApproveInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveInvoice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tuitionKeys.all });
      toast.success("Đã duyệt và xác nhận thanh toán");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useConfirmCashPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmCashPayment(id),
    onSuccess: (invoice) => {
      qc.invalidateQueries({ queryKey: tuitionKeys.all });
      toast.success(`Đã xác nhận thu tiền mặt từ ${invoice.studentName}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
