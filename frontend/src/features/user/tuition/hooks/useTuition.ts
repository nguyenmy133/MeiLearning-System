import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PaymentQRPayload } from "../types";
import { getMyInvoices, getInvoiceById, initiatePayment } from "../services";

export const tuitionKeys = {
    all: ["user-tuition"] as const,
    list: (month?: string) => [...tuitionKeys.all, "list", month] as const,
    detail: (id: string) => [...tuitionKeys.all, "detail", id] as const,
};

export function useMyInvoices(month?: string) {
    return useQuery({
        queryKey: tuitionKeys.list(month),
        queryFn: () => getMyInvoices(month),
    });
}

export function useInvoiceDetail(id: string) {
    return useQuery({
        queryKey: tuitionKeys.detail(id),
        queryFn: () => getInvoiceById(id),
        enabled: !!id,
    });
}

export function useInitiatePayment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: PaymentQRPayload) => initiatePayment(payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: tuitionKeys.all });
            toast.info(`Vui lòng quét mã QR để hoàn tất thanh toán ${variables.amount.toLocaleString("vi-VN")}đ.`);
        },
        onError: (err: Error) => toast.error(err.message),
    });
}
