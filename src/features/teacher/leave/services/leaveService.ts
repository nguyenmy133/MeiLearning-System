import type {
    StudentLeaveRequest,
    LeaveQueryParams,
    ReviewLeaveDTO,
    LeaveStats,
} from "../types";
import { mockLeaveRequests } from "../data/mockData";

const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

let db: StudentLeaveRequest[] = clone(mockLeaveRequests);

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * Get leave requests for teacher's classes.
 * Phase 2: GET /api/teacher/leave-requests?classId=&status=&type=
 */
export async function getLeaveRequests(
    _teacherId: number,
    params?: LeaveQueryParams
): Promise<StudentLeaveRequest[]> {
    await randomDelay();
    let result = clone(db);

    if (params?.classId && params.classId !== "all") {
        result = result.filter((r: StudentLeaveRequest) => r.classId === params.classId);
    }
    if (params?.status && params.status !== "all") {
        result = result.filter((r: StudentLeaveRequest) => r.status === params.status);
    }
    if (params?.type && params.type !== "all") {
        result = result.filter((r: StudentLeaveRequest) => r.type === params.type);
    }
    if (params?.search) {
        const q = params.search.toLowerCase();
        result = result.filter(
            (r: StudentLeaveRequest) =>
                r.studentName.toLowerCase().includes(q) || r.className.toLowerCase().includes(q)
        );
    }
    return result;
}

export async function getLeaveStats(_teacherId: number): Promise<LeaveStats> {
    await randomDelay();
    return {
        total: db.length,
        pending: db.filter((r) => r.status === "pending").length,
        approved: db.filter((r) => r.status === "approved").length,
        rejected: db.filter((r) => r.status === "rejected").length,
    };
}

/**
 * Approve a leave request.
 * NOTE: In full production flow, this should notify Admin for final confirmation.
 * Phase 2: PUT /api/teacher/leave-requests/{id}/approve
 */
export async function approveLeaveRequest(
    id: string,
    teacherId: number
): Promise<StudentLeaveRequest> {
    await randomDelay();

    const idx = db.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Không tìm thấy đơn xin nghỉ");
    if (db[idx].status !== "pending") {
        throw new Error("Đơn này đã được xử lý rồi.");
    }

    db[idx] = {
        ...db[idx],
        status: "approved",
        reviewedAt: new Date().toLocaleDateString("vi-VN"),
        reviewedById: teacherId,
    };
    return clone(db[idx]);
}

/**
 * Reject a leave request with a reason.
 * Phase 2: PUT /api/teacher/leave-requests/{id}/reject
 */
export async function rejectLeaveRequest(
    id: string,
    teacherId: number,
    dto: ReviewLeaveDTO
): Promise<StudentLeaveRequest> {
    await randomDelay();

    const idx = db.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Không tìm thấy đơn xin nghỉ");
    if (db[idx].status !== "pending") {
        throw new Error("Đơn này đã được xử lý rồi.");
    }
    if (!dto.rejectReason?.trim()) {
        throw new Error("Vui lòng nhập lý do từ chối.");
    }

    db[idx] = {
        ...db[idx],
        status: "rejected",
        reviewedAt: new Date().toLocaleDateString("vi-VN"),
        reviewedById: teacherId,
        rejectReason: dto.rejectReason,
    };
    return clone(db[idx]);
}

export function resetLeaveData(): void {
    db = clone(mockLeaveRequests);
}
