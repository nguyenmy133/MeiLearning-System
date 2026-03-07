import type {
    UserLeaveRequest,
    CreateLeaveRequestDTO,
    LeaveQueryParams,
} from "../types";

// ─── Mock database ────────────────────────────────────────────────────────────
const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

import { MOCK_LEAVE_REQUESTS } from "../data/mockData";

let db: UserLeaveRequest[] = clone(MOCK_LEAVE_REQUESTS);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Validate: Session date must be at least 24h from now.
 * Phase 2: Enforced on BE as well.
 */
function validateFutureDate(sessionDate: string): void {
    const session = new Date(sessionDate);
    const now = new Date();
    const diff = session.getTime() - now.getTime();
    if (diff < 24 * 60 * 60 * 1000) {
        throw new Error("Đơn xin nghỉ phải được gửi trước buổi học ít nhất 24 giờ.");
    }
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Get current user's leave requests.
 * Phase 2: GET /api/user/leave-requests
 */
export async function getMyLeaveRequests(
    params?: LeaveQueryParams
): Promise<UserLeaveRequest[]> {
    await randomDelay();
    let result = clone(db);

    if (params?.status && params.status !== "all") {
        result = result.filter((r: UserLeaveRequest) => r.status === params.status);
    }
    if (params?.type && params.type !== "all") {
        result = result.filter((r: UserLeaveRequest) => r.type === params.type);
    }

    // Sort newest first
    return result.sort(
        (a: UserLeaveRequest, b: UserLeaveRequest) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

/**
 * Submit a new leave request.
 * Business rule: sessionDate must be at least 24h in the future.
 * Phase 2: POST /api/user/leave-requests
 */
export async function createLeaveRequest(
    dto: CreateLeaveRequestDTO
): Promise<UserLeaveRequest> {
    await randomDelay();
    validateFutureDate(dto.sessionDate);

    const newRequest: UserLeaveRequest = {
        id: `lr-${Date.now()}`,
        classId: dto.classId,
        className: dto.classId, // Phase 2: resolved from BE by classId
        type: dto.type,
        sessionDate: dto.sessionDate,
        sessionTime: "TBD",     // Phase 2: resolved from class schedule
        reason: dto.reason,
        status: "pending",
        createdAt: new Date().toISOString(),
    };

    db.unshift(newRequest);
    return clone(newRequest);
}

/**
 * Cancel a pending leave request.
 * Phase 2: DELETE /api/user/leave-requests/{id}
 */
export async function cancelLeaveRequest(id: string): Promise<void> {
    await randomDelay();
    const idx = db.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Không tìm thấy đơn xin nghỉ.");
    if (db[idx].status !== "pending") {
        throw new Error("Chỉ có thể huỷ đơn đang chờ duyệt.");
    }
    db.splice(idx, 1);
}

export function resetLeaveData(): void {
    db = clone(MOCK_LEAVE_REQUESTS);
}
