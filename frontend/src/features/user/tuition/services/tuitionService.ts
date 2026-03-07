import type { TuitionInvoice, PaymentQRPayload } from "../types";

const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Billing formula:
//   billableSessions = present + absentUnexcused + late
//   totalAmount      = billableSessions × pricePerSession
// ABSENT_EXCUSED sessions are NOT counted → not billed.

import { MOCK_INVOICES } from "../data/mockData";

let db: TuitionInvoice[] = clone(MOCK_INVOICES);

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Get all invoices for the current user.
 * Phase 2: GET /api/user/tuition/invoices
 */
export async function getMyInvoices(month?: string): Promise<TuitionInvoice[]> {
    await randomDelay();
    let result = clone(db);
    if (month) {
        result = result.filter((inv: TuitionInvoice) => inv.month === month);
    }
    return result.sort((a: TuitionInvoice, b: TuitionInvoice) =>
        b.month.localeCompare(a.month)
    );
}

/**
 * Get a single invoice by ID.
 * Phase 2: GET /api/user/tuition/invoices/{id}
 */
export async function getInvoiceById(id: string): Promise<TuitionInvoice> {
    await randomDelay();
    const inv = db.find((i) => i.id === id);
    if (!inv) throw new Error("Không tìm thấy hoá đơn.");
    return clone(inv);
}

/**
 * Initiate a QR payment for an invoice.
 * Sets status to "reviewing" to prevent double-payment.
 * Phase 2: POST /api/user/tuition/invoices/{id}/pay → returns VNPay/Momo URL
 */
export async function initiatePayment(payload: PaymentQRPayload): Promise<{ qrUrl: string }> {
    await randomDelay();
    const idx = db.findIndex((i) => i.id === payload.invoiceId);
    if (idx === -1) throw new Error("Không tìm thấy hoá đơn.");
    if (db[idx].status === "reviewing") {
        throw new Error("Hoá đơn này đang được đối soát. Vui lòng chờ xác nhận.");
    }
    if (db[idx].status === "paid") {
        throw new Error("Hoá đơn này đã được thanh toán.");
    }

    // Lock invoice to prevent re-click
    db[idx].status = "reviewing";

    // Phase 2: Return actual payment gateway URL
    return {
        qrUrl: `https://qr.meilearning.vn/pay?invoice=${payload.invoiceId}&amount=${payload.amount}`,
    };
}
