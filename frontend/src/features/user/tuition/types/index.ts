// ─── Tuition Types ────────────────────────────────────────────────────────────
// Business Rule (Billing):
//   Billable sessions = PRESENT + ABSENT_UNEXCUSED + LATE
//   Non-billable     = ABSENT_EXCUSED (approved leave)
//   Formula: Total = billableSessions * pricePerSession

export type InvoiceStatus = "pending" | "paid" | "overdue" | "reviewing";

export interface TuitionInvoice {
    id: number;
    month: string;          // "MM/YYYY"
    classId: number;
    className: string;
    status: InvoiceStatus;
    dueDate: string;        // "YYYY-MM-DD"
    createdAt: string;      // ISO timestamp
    paidAt?: string;

    // ─── Breakdown ─────────────────────────────────────────
    totalSessions: number;
    presentSessions: number;
    absentExcusedSessions: number;
    absentUnexcusedSessions: number;
    lateSessions: number;

    /** = presentSessions + absentUnexcusedSessions + lateSessions */
    billableSessions: number;
    pricePerSession: number;

    /** = billableSessions * pricePerSession */
    totalAmount: number;
}

export interface PaymentQRPayload {
    invoiceId: number;
    amount: number;
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
    pending: "Chưa thanh toán",
    paid: "Đã thanh toán",
    overdue: "Quá hạn",
    reviewing: "Đang đối soát",
};
