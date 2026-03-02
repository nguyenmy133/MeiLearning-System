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
