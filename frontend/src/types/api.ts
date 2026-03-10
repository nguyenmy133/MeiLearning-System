/**
 * ============================================================================
 * SHARED API RESPONSE TYPES
 * ============================================================================
 *
 * Các interface dùng chung cho tất cả API responses.
 * Feature-level types nên import từ đây thay vì tự khai báo lại.
 *
 * @example
 * ```ts
 * import type { PaginatedResponse, ApiErrorResponse } from "@/types";
 * ```
 * ============================================================================
 */

/** Response chuẩn cho list có phân trang */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/** Response chuẩn cho API trả về single item */
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

/** Response chuẩn khi API trả về lỗi  */
export interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
    statusCode: number;
}

/** Params phân trang dùng chung — feature QueryParams nên extend từ đây */
export interface PaginationParams {
    page?: number;
    limit?: number;
}

/** Params sắp xếp dùng chung */
export interface SortParams {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

/** Kết hợp pagination + sort (dùng cho hầu hết list endpoints) */
export interface ListQueryParams extends PaginationParams, SortParams {
    search?: string;
}
