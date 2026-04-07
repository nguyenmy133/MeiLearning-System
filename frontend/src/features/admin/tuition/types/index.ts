export type InvoiceStatus = "paid" | "reviewing" | "pending" | "overdue";

export interface TuitionInvoice {
  id: number;
  studentId: number;
  /** Short ID used in QR payment reference */
  studentRef: string;
  studentName: string;
  studentAvatar: string;
  classId: number;
  className: string;
  subjectName: string;
  month: string; // "MM/YYYY"

  // ── Breakdown ─────────────────────────────────────────
  totalSessions: number;
  presentSessions: number;
  absentExcusedSessions: number;
  absentUnexcusedSessions: number;
  lateSessions: number;
  billableSessions: number;
  pricePerSession: number;

  totalAmount: number;
  discountAmount: number;
  discountReason: string | null;
  dueDate: string;
  status: InvoiceStatus;
  paidDate: string | null;
  paymentMethod: string | null;
  paymentProofUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TuitionStats {
  totalRevenue: number;
  monthRevenue: number;
  pendingCount: number;
  reviewingCount: number;
  paidCount: number;
  overdueCount: number;
  totalInvoices: number;
}

export interface TuitionQueryParams {
  search?: string;
  month?: string;
  status?: InvoiceStatus | "all";
  className?: string;
  page?: number;
  limit?: number;
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  paid: "Đã thu",
  reviewing: "Chờ đối soát",
  pending: "Chưa thu",
  overdue: "Quá hạn",
};
