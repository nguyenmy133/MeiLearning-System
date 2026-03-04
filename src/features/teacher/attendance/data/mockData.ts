import type { TeacherSession, AttendeeRecord } from "../types";

// ── Mock sessions for teacher ID=1 (current week) ─────────────────────────────
export const mockSessions: TeacherSession[] = [
    {
        id: 101,
        classId: 1,
        className: "Toán 10A",
        teacherId: 1,
        date: "2026-03-03",
        startTime: "14:00",
        endTime: "16:00",
        room: "P.101",
        subject: "Toán",
        status: "completed",
        attendanceStatus: "confirmed",
    },
    {
        id: 102,
        classId: 6,
        className: "Lý 10-B",
        teacherId: 1,
        date: "2026-03-04",
        startTime: "16:30",
        endTime: "18:30",
        room: "P.102",
        subject: "Vật Lý",
        status: "scheduled",
        attendanceStatus: "not_started",
    },
    {
        id: 103,
        classId: 1,
        className: "Toán 10A",
        teacherId: 1,
        date: "2026-03-05",
        startTime: "14:00",
        endTime: "16:00",
        room: "P.101",
        subject: "Toán",
        status: "scheduled",
        attendanceStatus: "not_started",
    },
    {
        id: 104,
        classId: 8,
        className: "Toán 11-Nâng cao",
        teacherId: 1,
        date: "2026-03-06",
        startTime: "16:30",
        endTime: "18:30",
        room: "P.201",
        subject: "Toán",
        status: "scheduled",
        attendanceStatus: "not_started",
    },
];

// ── Attendees per session ─────────────────────────────────────────────────────
export const mockAttendeesMap: Record<number, AttendeeRecord[]> = {
    101: [
        { id: 1, studentId: "HV001", name: "Nguyễn Minh Anh", status: "present", checkinTime: "14:02", method: "qr", absenceCount: 0 },
        { id: 2, studentId: "HV002", name: "Trần Thị B", status: "present", checkinTime: "14:03", method: "qr", absenceCount: 1 },
        { id: 3, studentId: "HV003", name: "Lê Văn C", status: "late", checkinTime: "14:12", method: "manual", absenceCount: 0 },
        { id: 4, studentId: "HV004", name: "Phạm Thị D", status: "absent", checkinTime: null, method: null, absenceCount: 3 },
        { id: 5, studentId: "HV005", name: "Hoàng Thị Em", status: "absent_excused", checkinTime: null, method: null, absenceCount: 2 },
    ],
    102: [
        { id: 1, studentId: "HV011", name: "Nguyễn An", status: "pending", checkinTime: null, method: null, absenceCount: 0 },
        { id: 2, studentId: "HV012", name: "Trần Bình", status: "pending", checkinTime: null, method: null, absenceCount: 1 },
        { id: 3, studentId: "HV013", name: "Lê Chính", status: "pending", checkinTime: null, method: null, absenceCount: 0 },
        { id: 4, studentId: "HV014", name: "Phạm Duy", status: "pending", checkinTime: null, method: null, absenceCount: 2 },
        { id: 5, studentId: "HV015", name: "Hoàng Em", status: "pending", checkinTime: null, method: null, absenceCount: 0 },
        { id: 6, studentId: "HV016", name: "Vũ Phi", status: "pending", checkinTime: null, method: null, absenceCount: 0 },
    ],
    103: [
        { id: 1, studentId: "HV001", name: "Nguyễn Minh Anh", status: "pending", checkinTime: null, method: null, absenceCount: 0 },
        { id: 2, studentId: "HV002", name: "Trần Thị B", status: "pending", checkinTime: null, method: null, absenceCount: 1 },
        { id: 3, studentId: "HV003", name: "Lê Văn C", status: "pending", checkinTime: null, method: null, absenceCount: 0 },
        { id: 4, studentId: "HV004", name: "Phạm Thị D", status: "pending", checkinTime: null, method: null, absenceCount: 3 },
        { id: 5, studentId: "HV005", name: "Hoàng Thị Em", status: "pending", checkinTime: null, method: null, absenceCount: 2 },
    ],
    104: [
        { id: 1, studentId: "HV021", name: "Đặng Anh", status: "pending", checkinTime: null, method: null, absenceCount: 0 },
        { id: 2, studentId: "HV022", name: "Bùi Bình", status: "pending", checkinTime: null, method: null, absenceCount: 0 },
        { id: 3, studentId: "HV023", name: "Cao Chính", status: "pending", checkinTime: null, method: null, absenceCount: 1 },
    ],
};
