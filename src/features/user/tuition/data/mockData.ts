import type { TuitionInvoice } from "../types";

export const MOCK_INVOICES: TuitionInvoice[] = [
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
