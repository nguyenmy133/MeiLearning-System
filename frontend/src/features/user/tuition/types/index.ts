// ─── Tuition Types ────────────────────────────────────────────────────────────
// Business Rule (Billing):
//   Billable sessions = PRESENT + ABSENT_UNEXCUSED
//   Non-billable     = ABSENT_EXCUSED (approved leave)
//   Formula: Total = billableSessions * pricePerSession

export type InvoiceStatus = "pending" | "paid" | "overdue" | "reviewing";

export interface TuitionSession {
    sessionId: string;
    date: string;   // "YYYY-MM-DD"
    className: string;
    status: "PRESENT" | "ABSENT_EXCUSED" | "ABSENT_UNEXCUSED" | "LATE";
    /** Computed from status */
    isBillable: boolean;
    pricePerSession: number;
}

export interface TuitionInvoice {
    id: string;
    month: string;          // "YYYY-MM"
    classId: string;
    className: string;
    status: InvoiceStatus;
    dueDate: string;        // "YYYY-MM-DD"
    issuedAt: string;       // ISO timestamp
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
    invoiceId: string;
    amount: number;
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
    pending: "Chưa thanh toán",
    paid: "Đã thanh toán",
    overdue: "Quá hạn",
    reviewing: "Đang đối soát",
};
