import type { TuitionInvoice, TuitionStats, TuitionQueryParams } from "../types";
import { mockInvoices, mockTuitionStats } from "../data/mockData";

// ── Helpers ───────────────────────────────────────────────────────────────────
const randomDelay = () =>
  new Promise((res) => setTimeout(res, 300 + Math.random() * 400));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

function todayLabel(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ── In-memory DB ──────────────────────────────────────────────────────────────
let db: TuitionInvoice[] = clone(mockInvoices);

// ── Service ───────────────────────────────────────────────────────────────────

export async function getInvoices(
  params?: TuitionQueryParams
): Promise<TuitionInvoice[]> {
  await randomDelay();
  let result = clone(db);

  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (p: TuitionInvoice) =>
        p.studentName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }
  if (params?.status && params.status !== "all") {
    result = result.filter((p: TuitionInvoice) => p.status === params.status);
  }
  if (params?.month && params.month !== "all") {
    result = result.filter((p: TuitionInvoice) => p.month === params.month);
  }
  if (params?.className && params.className !== "all") {
    result = result.filter((p: TuitionInvoice) =>
      p.details.some((d) => d.className === params.className)
    );
  }

  return result;
}

export async function getTuitionStats(): Promise<TuitionStats> {
  await randomDelay();
  return clone(mockTuitionStats);
}

/** Approve a "reviewing" invoice → "paid" */
export async function approveInvoice(id: string): Promise<TuitionInvoice> {
  await randomDelay();
  const idx = db.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Không tìm thấy hóa đơn");
  if (db[idx].status !== "reviewing") {
    throw new Error("Chỉ có thể duyệt hóa đơn đang ở trạng thái chờ đối soát");
  }
  db[idx] = {
    ...db[idx],
    status: "paid",
    paidDate: todayLabel(),
    updatedAt: new Date().toISOString(),
  };
  return clone(db[idx]);
}

/** Mark a pending/overdue invoice as paid via cash */
export async function confirmCashPayment(id: string): Promise<TuitionInvoice> {
  await randomDelay();
  const idx = db.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Không tìm thấy hóa đơn");
  if (db[idx].status !== "pending" && db[idx].status !== "overdue") {
    throw new Error("Chỉ có thể thu tiền mặt cho hóa đơn chưa thu hoặc quá hạn");
  }
  db[idx] = {
    ...db[idx],
    status: "paid",
    paidDate: todayLabel(),
    paymentMethod: "Tiền mặt",
    updatedAt: new Date().toISOString(),
  };
  return clone(db[idx]);
}

/** Reset in-memory DB (dev utility) */
export function resetTuitionData(): void {
  db = clone(mockInvoices);
}

/**
 * [POST] /api/tuition/generate
 * Chốt công và tạo hóa đơn hàng loạt cho một tháng.
 * - Mock: đếm số buổi học thực tế từ attendance sessions.
 * - Tạo mới các invoice cho những học viên chưa có invoice tháng đó.
 * Returns số hóa đơn được tạo.
 */
export async function generateMonthlyInvoices(
  month: string // "MM/YYYY"
): Promise<{ generated: number; skipped: number }> {
  await randomDelay();

  if (!month.match(/^\d{2}\/\d{4}$/)) {
    throw new Error(`Định dạng tháng không hợp lệ: “${month}” (cần MM/YYYY)`);
  }

  // Kiểm tra hóa đơn đã tồn tại cho tháng này
  const existing = db.filter((inv) => inv.month === month).map((inv) => inv.studentId);

  // Giả lập: tạo bill cho các studentId 1-5 nếu chưa có
  const candidates = [1, 2, 3, 4, 5].filter((sid) => !existing.includes(sid));

  const [mm, yyyy] = month.split("/");
  const dueDate = `05/${String(Number(mm) % 12 + 1).padStart(2, "0")}/${mm === "12" ? Number(yyyy) + 1 : yyyy}`;
  const now = new Date().toISOString();

  const newInvoices: TuitionInvoice[] = candidates.map((sid, i) => ({
    id: `INV_${mm}${yyyy}_${String(existing.length + i + 1).padStart(3, "0")}`,
    studentId: sid,
    studentRef: String(sid).padStart(3, "0"),
    studentName: ["Nguyễn Văn An", "Trần Thị Bích", "Lê Minh Cường", "Phạm Thị Dung", "Hoàng Văn Em"][sid - 1],
    studentAvatar: "",
    month,
    totalAmount: 1500000,
    discountAmount: 0,
    discountReason: null,
    dueDate,
    status: "pending",
    paidDate: null,
    paymentMethod: null,
    paymentProofUrl: null,
    details: [{ className: "Toán 10A", billableSessions: 10, pricePerSession: 150000, subTotal: 1500000 }],
    createdAt: now,
    updatedAt: now,
  }));

  db.push(...newInvoices);

  return { generated: newInvoices.length, skipped: existing.length };
}
