/**
 * ============================================================================
 * API ENDPOINT CONSTANTS
 * ============================================================================
 *
 * Tập trung tất cả API endpoints ở một nơi.
 * Khi Backend thay đổi URL → chỉ sửa ở đây.
 *
 * @example
 * ```ts
 * import { API } from "@/config";
 * apiClient.get(API.STUDENTS.LIST);
 * apiClient.get(API.STUDENTS.DETAIL(id));
 * ```
 * ============================================================================
 */

export const API = {
    // ── Auth ────────────────────────────────────────────────────
    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
        ME: "/auth/me",
        CHANGE_PASSWORD: "/auth/change-password",
    },

    // ── Students ────────────────────────────────────────────────
    STUDENTS: {
        LIST: "/students",
        DETAIL: (id: number | string) => `/students/${id}`,
        CREATE: "/students",
        UPDATE: (id: number | string) => `/students/${id}`,
        DELETE: (id: number | string) => `/students/${id}`,
        DROP: (id: number | string) => `/students/${id}/drop`,
        REACTIVATE: (id: number | string) => `/students/${id}/reactivate`,
        RESET_PASSWORD: (id: number | string) => `/students/${id}/reset-password`,
        STATS: "/students/stats",
        IMPORT: "/students/import",
    },

    // ── Teachers ────────────────────────────────────────────────
    TEACHERS: {
        LIST: "/teachers",
        DETAIL: (id: number | string) => `/teachers/${id}`,
        CREATE: "/teachers",
        UPDATE: (id: number | string) => `/teachers/${id}`,
        DELETE: (id: number | string) => `/teachers/${id}`,
        RESET_PASSWORD: (id: number | string) => `/teachers/${id}/reset-password`,
        LOCK: (id: number | string) => `/teachers/${id}/lock`,
        UNLOCK: (id: number | string) => `/teachers/${id}/unlock`,
        STATS: "/teachers/stats",
    },

    // ── Classes ─────────────────────────────────────────────────
    CLASSES: {
        LIST: "/classes",
        DETAIL: (id: number | string) => `/classes/${id}`,
        CREATE: "/classes",
        UPDATE: (id: number | string) => `/classes/${id}`,
        DELETE: (id: number | string) => `/classes/${id}`,
        END: (id: number | string) => `/classes/${id}/end`,
        STATS: "/classes/stats",
    },

    // ── Subjects ────────────────────────────────────────────────
    SUBJECTS: {
        LIST: "/subjects",
        DETAIL: (id: number | string) => `/subjects/${id}`,
        CREATE: "/subjects",
        UPDATE: (id: number | string) => `/subjects/${id}`,
        DELETE: (id: number | string) => `/subjects/${id}`,
        STATS: "/subjects/stats",
    },

    // ── Facilities & Rooms ──────────────────────────────────────
    FACILITIES: {
        LIST: "/facilities",
        DETAIL: (id: number | string) => `/facilities/${id}`,
        CREATE: "/facilities",
        UPDATE: (id: number | string) => `/facilities/${id}`,
        DELETE: (id: number | string) => `/facilities/${id}`,
        STATS: "/facilities/stats",
    },
    ROOMS: {
        LIST: "/rooms",
        DETAIL: (id: number | string) => `/rooms/${id}`,
        CREATE: "/rooms",
        UPDATE: (id: number | string) => `/rooms/${id}`,
        DELETE: (id: number | string) => `/rooms/${id}`,
    },

    // ── Schedule ────────────────────────────────────────────────
    SCHEDULE: {
        LIST: "/schedule",
    },

    // ── Attendance ──────────────────────────────────────────────
    ATTENDANCE: {
        LIST: "/attendance",
        CHECK_IN: "/attendance/check-in",
    },

    // ── Tuition ─────────────────────────────────────────────────
    TUITION: {
        LIST: "/tuition",
        DETAIL: (id: number | string) => `/tuition/${id}`,
    },

    // ── Leave ───────────────────────────────────────────────────
    LEAVE: {
        LIST: "/leave",
        CREATE: "/leave",
        APPROVE: (id: number | string) => `/leave/${id}/approve`,
        REJECT: (id: number | string) => `/leave/${id}/reject`,
    },

    // ── Reschedule ──────────────────────────────────────────────
    RESCHEDULE: {
        LIST: "/reschedule",
        CREATE: "/reschedule",
        APPROVE: (id: number | string) => `/reschedule/${id}/approve`,
        REJECT: (id: number | string) => `/reschedule/${id}/reject`,
    },

    // ── Exams ───────────────────────────────────────────────────
    EXAMS: {
        LIST: "/exams",
        DETAIL: (id: number | string) => `/exams/${id}`,
        CREATE: "/exams",
        UPDATE: (id: number | string) => `/exams/${id}`,
        DELETE: (id: number | string) => `/exams/${id}`,
        SUBMIT: (id: number | string) => `/exams/${id}/submit`,
        RESULTS: (id: number | string) => `/exams/${id}/results`,
    },

    // ── Grades ──────────────────────────────────────────────────
    GRADES: {
        LIST: "/grades",
        UPDATE: (id: number | string) => `/grades/${id}`,
    },

    // ── Notifications ───────────────────────────────────────────
    NOTIFICATIONS: {
        LIST: "/notifications",
        MARK_READ: (id: number | string) => `/notifications/${id}/read`,
        MARK_ALL_READ: "/notifications/read-all",
    },

    // ── Reports ─────────────────────────────────────────────────
    REPORTS: {
        OVERVIEW: "/reports/overview",
        ATTENDANCE: "/reports/attendance",
        TUITION: "/reports/tuition",
        EXPORT: "/reports/export",
    },

    // ── Profile ─────────────────────────────────────────────────
    PROFILE: {
        ME: "/profile/me",
        UPDATE: "/profile/me",
        AVATAR: "/profile/avatar",
    },

    // ── QR Settings ─────────────────────────────────────────────
    QR_SETTINGS: {
        GET: "/qr-settings",
        UPDATE: "/qr-settings",
    },

    // ── Documents ───────────────────────────────────────────────
    DOCUMENTS: {
        LIST: "/documents",
        DETAIL: (id: number | string) => `/documents/${id}`,
        UPLOAD: "/documents",
        DELETE: (id: number | string) => `/documents/${id}`,
    },
} as const;
