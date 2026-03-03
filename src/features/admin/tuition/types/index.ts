export type InvoiceStatus = "paid" | "reviewing" | "pending" | "overdue";

export interface InvoiceDetail {
  className: string;
  billableSessions: number;
  pricePerSession: number;
  subTotal: number;
}

export interface TuitionInvoice {
  id: string;
  studentId: number;              // FK → Student.id
  /** Short ID used in QR payment reference */
  studentRef: string;
  studentName: string;
  studentAvatar: string;
  month: string; // "MM/YYYY"
  totalAmount: number;
  discountAmount: number;         // Giảm giá (0 nếu không giảm)
  discountReason: string | null;  // Lý do giảm giá
  dueDate: string; // "DD/MM/YYYY"
  status: InvoiceStatus;
  paidDate: string | null; // "DD/MM/YYYY"
  paymentMethod: string | null;
  paymentProofUrl: string | null; // ảnh chụp chuyển khoản (QR flow)
  details: InvoiceDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface TuitionStats {
  totalRevenue: number;
  monthRevenue: number;
  pending: number;
  overdue: number;
}

export interface TuitionQueryParams {
  search?: string;
  month?: string;
  status?: InvoiceStatus | "all";
  className?: string;
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  paid: "Đã thu",
  reviewing: "Chờ đối soát",
  pending: "Chưa thu",
  overdue: "Quá hạn",
};

/** Phải khớp với Class.name trong classes/data/mockData.
 *  Khi BE xong → thay bằng API call GET /classes?status=active */
export const TUITION_CLASS_LIST = [
  "Toán 10A",
  "Lý 10-B",
  "IELTS-01",
  "Hóa 11-A",
  "Văn 12 - Luyện thi",
  "TOEIC-A1",
] as const;

export const TUITION_MONTHS = ["09/2024", "08/2024"] as const;
