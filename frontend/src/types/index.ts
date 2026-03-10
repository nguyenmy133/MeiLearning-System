// ── Shared Types ─────────────────────────────────────────────────
// Re-export everything so consumers can use: import { ... } from "@/types"

export type { Gender, DateString, DateTimeString, EntityId, BaseEntity } from "./common";

export type {
    PaginatedResponse,
    ApiResponse,
    ApiErrorResponse,
    PaginationParams,
    SortParams,
    ListQueryParams,
} from "./api";
