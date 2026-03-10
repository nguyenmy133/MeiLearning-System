/**
 * ============================================================================
 * SHARED DOMAIN TYPES
 * ============================================================================
 *
 * Các type dùng chung giữa nhiều feature modules.
 * Nếu một type chỉ thuộc 1 feature → giữ trong feature/types/.
 * Nếu type được dùng ở ≥ 2 features → đặt ở đây.
 *
 * @example
 * ```ts
 * import type { Gender, DateString } from "@/types";
 * ```
 * ============================================================================
 */

/** Giới tính — dùng cho Student, Teacher, và các entity khác có trường gender */
export type Gender = "male" | "female" | "other";

/** ISO date string (YYYY-MM-DD) — dùng để annotate các trường ngày tháng */
export type DateString = string;

/** ISO datetime string (YYYY-MM-DDTHH:mm:ss) */
export type DateTimeString = string;

/** ID dạng number — dùng cho tất cả entity */
export type EntityId = number;

/** Base entity fields — hầu hết entities đều có */
export interface BaseEntity {
    id: EntityId;
    createdAt: DateString;
    updatedAt: DateString;
}
