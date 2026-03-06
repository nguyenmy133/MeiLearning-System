import type { TuitionInvoice, PaymentQRPayload } from "../types";

const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Billing formula:
//   billableSessions = present + absentUnexcused + late
//   totalAmount      = billableSessions × pricePerSession
// ABSENT_EXCUSED sessions are NOT counted → not billed.

const MOCK_INVOICES: TuitionInvoice[] = [
    {
        id: "inv-2026-03-toan",
        month: "2026-03",
        classId: "class-toan-10a",
        className: "Toán 10A",
        status: "pending",
        dueDate: "2026-04-05",
        issuedAt: "2026-03-31T00:00:00Z",

        totalSessions: 13,
        presentSessions: 10,
        absentExcusedSessions: 1,    // Approved leave → NOT billed
        absentUnexcusedSessions: 1,  // No leave → billed
        lateSessions: 1,

        billableSessions: 12,        // 10 present + 1 unexcused + 1 late
        pricePerSession: 80_000,
        totalAmount: 960_000,        // 12 × 80,000
    },
    {
        id: "inv-2026-03-anh",
        month: "2026-03",
        classId: "class-anh-10a",
        className: "Tiếng Anh 10A",
        status: "reviewing",
        dueDate: "2026-04-05",
        issuedAt: "2026-03-31T00:00:00Z",

        totalSessions: 8,
        presentSessions: 8,
        absentExcusedSessions: 0,
        absentUnexcusedSessions: 0,
        lateSessions: 0,

        billableSessions: 8,
        pricePerSession: 100_000,
        totalAmount: 800_000,
    },
    {
        id: "inv-2026-02-toan",
        month: "2026-02",
        classId: "class-toan-10a",
        className: "Toán 10A",
        status: "paid",
        dueDate: "2026-03-05",
        issuedAt: "2026-02-28T00:00:00Z",
        paidAt: "2026-03-04T14:32:00Z",

        totalSessions: 11,
        presentSessions: 9,
        absentExcusedSessions: 2,   // 2 approved → not billed
        absentUnexcusedSessions: 0,
        lateSessions: 0,

        billableSessions: 9,        // only present sessions
        pricePerSession: 80_000,
        totalAmount: 720_000,       // 9 × 80,000
    },
];

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
        qrUrl: `https://qr.meilearn.vn/pay?invoice=${payload.invoiceId}&amount=${payload.amount}`,
    };
}
