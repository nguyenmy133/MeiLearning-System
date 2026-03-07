import type { AttendanceRecord } from "../types";

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
    {
        id: "att-001",
        sessionId: "sess-002",
        classId: "class-anh-10a",
        className: "Tiếng Anh 10A",
        date: "2026-03-04",
        sessionTime: "08:00 - 10:00",
        status: "PRESENT",
        isBillable: true,
        checkedInAt: "2026-03-04T07:58:00Z",
    },
    {
        id: "att-002",
        sessionId: "sess-003",
        classId: "class-toan-10a",
        className: "Toán 10A",
        date: "2026-03-03",
        sessionTime: "18:00 - 20:00",
        status: "ABSENT_EXCUSED",
        isBillable: false,   // ← NOT billed (approved leave)
        note: "Đơn xin nghỉ đã được Giáo viên duyệt.",
    },
    {
        id: "att-003",
        sessionId: "sess-101",
        classId: "class-toan-10a",
        className: "Toán 10A",
        date: "2026-02-28",
        sessionTime: "18:00 - 20:00",
        status: "ABSENT_UNEXCUSED",
        isBillable: true,   // ← Still billed (no leave)
    },
    {
        id: "att-004",
        sessionId: "sess-102",
        classId: "class-toan-10a",
        className: "Toán 10A",
        date: "2026-02-26",
        sessionTime: "18:00 - 20:00",
        status: "LATE",
        isBillable: true,
        checkedInAt: "2026-02-26T18:18:00Z",
        note: "Đến muộn 18 phút.",
    },
];
