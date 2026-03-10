/**
 * ============================================================================
 * APP-LEVEL CONFIGURATION
 * ============================================================================
 *
 * Constants & defaults dùng chung toàn ứng dụng.
 * Env vars được đọc ở đây → các module khác chỉ cần import từ @/config.
 *
 * @example
 * ```ts
 * import { APP_CONFIG } from "@/config";
 * console.log(APP_CONFIG.APP_NAME);
 * ```
 * ============================================================================
 */

export const APP_CONFIG = {
    /** Tên ứng dụng */
    APP_NAME: "MeiLearning",

    /** API base URL — lấy từ env hoặc fallback localhost */
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",

    /** Request timeout (ms) */
    API_TIMEOUT: 10_000,

    /** Zalo URL */
    ZALO_URL: import.meta.env.VITE_ZALO_URL || "https://zalo.me",

    /** Hotline */
    HOTLINE: import.meta.env.VITE_HOTLINE || "19001234",

    /** Pagination defaults */
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
    },

    /** Date format dùng cho hiển thị */
    DATE_FORMAT: "dd/MM/yyyy",
    DATETIME_FORMAT: "dd/MM/yyyy HH:mm",

    /** Danh sách ngày trong tuần (Việt Nam) */
    WEEKDAYS: [
        { value: 1, label: "T2" },
        { value: 2, label: "T3" },
        { value: 3, label: "T4" },
        { value: 4, label: "T5" },
        { value: 5, label: "T6" },
        { value: 6, label: "T7" },
        { value: 0, label: "CN" },
    ] as const,

    /** Danh sách môn học (tạm thời — khi BE xong sẽ lấy từ API) */
    SUBJECT_OPTIONS: [
        "Toán",
        "Vật Lý",
        "Hóa Học",
        "Sinh Học",
        "Tiếng Anh",
        "Văn",
        "Tin Học",
        "Địa Lý",
    ] as const,

    /** Danh sách cơ sở (tạm thời — khi BE xong sẽ lấy từ API) */
    FACILITY_OPTIONS: [
        "Cơ sở Quận 1",
        "Cơ sở Quận 3",
        "Cơ sở Thủ Đức",
    ] as const,
} as const;

/** Derived types từ APP_CONFIG */
export type SubjectType = (typeof APP_CONFIG.SUBJECT_OPTIONS)[number];
export type FacilityType = (typeof APP_CONFIG.FACILITY_OPTIONS)[number];
