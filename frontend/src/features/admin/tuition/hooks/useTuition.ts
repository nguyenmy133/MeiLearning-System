import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { TuitionQueryParams } from "../types";
import {
  getInvoices,
  getTuitionStats,
  approveInvoice,
  confirmCashPayment,
  generateMonthlyInvoices,
  remindAll,
  remindOne,
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
    mutationFn: (id: number) => approveInvoice(id),
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
    mutationFn: (id: number) => confirmCashPayment(id),
    onSuccess: (invoice) => {
      qc.invalidateQueries({ queryKey: tuitionKeys.all });
      toast.success(`Đã xác nhận thu tiền mặt từ ${invoice.studentName}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useGenerateMonthlyInvoices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (month: string) => generateMonthlyInvoices(month),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: tuitionKeys.all });
      const generated = Array.isArray(data) ? data.length : 0;
      if (generated === 0) {
        toast.info("Không có hóa đơn nào cần tạo cho tháng này.");
      } else {
        toast.success(`Đã tạo ${generated} hóa đơn mới`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Không thể tạo hóa đơn. Vui lòng thử lại.");
    },
  });
}

export function useRemindAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => remindAll(),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: tuitionKeys.all });
      toast.success(
        `Đã gửi nhắc nợ thành công ${data.sent} hóa đơn` +
          (data.failed > 0 ? ` (${data.failed} thất bại)` : "")
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gửi nhắc nợ thất bại");
    },
  });
}

export function useRemindOne() {
  return useMutation({
    mutationFn: (id: number) => remindOne(id),
    onSuccess: () => {
      toast.success("Đã gửi nhắc nợ thành công");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gửi nhắc nợ thất bại");
    },
  });
}
