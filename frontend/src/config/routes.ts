/**
 * ============================================================================
 * ROUTE PATH CONSTANTS
 * ============================================================================
 *
 * Tập trung tất cả route paths ở một nơi để:
 * - Tránh hardcode string rải rác
 * - Dễ đổi path mà không phải tìm/sửa nhiều file
 * - Autocomplete khi dùng ROUTES.xxx
 *
 * @example
 * ```ts
 * import { ROUTES } from "@/config";
 * navigate(ROUTES.ADMIN.DASHBOARD);
 * ```
 * ============================================================================
 */

export const ROUTES = {
    // ── Public ──────────────────────────────────────────────────
    HOME: "/",
    ABOUT: "/about",
    TEACHERS_PUBLIC: "/teachers",
    CONTACT: "/contact",
    LOGIN: "/login",

    // ── Error pages ─────────────────────────────────────────────
    FORBIDDEN: "/403",

    // ── User (Student) Portal ───────────────────────────────────
    USER: {
        ROOT: "/user",
        DASHBOARD: "/user/dashboard",
        CHECK_IN: "/user/check-in",
        SCHEDULE: "/user/schedule",
        ATTENDANCE: "/user/attendance",
        DOCUMENTS: "/user/documents",
        EXAMS: "/user/exams",
        EXAM_TAKING: "/user/exam-taking",
        EXAM_RESULT: "/user/exam-result",
        TUITION: "/user/tuition",
        LEAVE: "/user/leave",
        GRADES: "/user/grades",
        GAMES: "/user/games",
        NOTIFICATIONS: "/user/notifications",
        PROFILE: "/user/profile",
    },

    // ── Teacher Portal ──────────────────────────────────────────
    TEACHER: {
        ROOT: "/teacher",
        DASHBOARD: "/teacher/dashboard",
        ATTENDANCE: "/teacher/attendance",
        SCHEDULE: "/teacher/schedule",
        CLASSES: "/teacher/classes",
        DOCUMENTS: "/teacher/documents",
        EXAMS: "/teacher/exams",
        EXAM_CREATE: "/teacher/exams/create",
        EXAM_EDIT: (id: number | string) => `/teacher/exams/edit/${id}`,
        EXAM_RESULTS: (examId: number | string) => `/teacher/exams/results/${examId}`,
        EXAM_STUDENT_RESULT: (examId: number | string, studentId: number | string) =>
            `/teacher/exams/results/${examId}/student/${studentId}`,
        GRADES: "/teacher/grades",
        RESCHEDULE: "/teacher/reschedule",
        LEAVE_APPROVAL: "/teacher/leave-approval",
        NOTIFICATIONS: "/teacher/notifications",
        PROFILE: "/teacher/profile",
    },

    // ── Admin Portal ────────────────────────────────────────────
    ADMIN: {
        ROOT: "/admin",
        DASHBOARD: "/admin/dashboard",
        QR_SETTINGS: "/admin/qr-settings",
        TEACHERS: "/admin/teachers",
        STUDENTS: "/admin/students",
        SUBJECTS: "/admin/subjects",
        CLASSES: "/admin/classes",
        SCHEDULE: "/admin/schedule",
        ATTENDANCE: "/admin/attendance",
        TUITION: "/admin/tuition",
        RESCHEDULE_APPROVAL: "/admin/reschedule-approval",
        FACILITIES: "/admin/facilities",
        REPORTS: "/admin/reports",
        NOTIFICATIONS: "/admin/notifications",
        PROFILE: "/admin/profile",
    },
} as const;
