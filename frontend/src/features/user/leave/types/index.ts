// ─── Leave Request Types ──────────────────────────────────────────────────────
// Business rule: Teacher is the one who reviews leave requests.
// Excused absence (approved leave) = not billed.

export type LeaveRequestStatus = "pending" | "approved" | "rejected";
export type LeaveRequestType = "leave" | "late";

export interface UserLeaveRequest {
    id: string;
    className?: string;
    type: LeaveRequestType;
    sessionId?: number;
    sessionDate?: string;
    startTime?: string;
    endTime?: string;
    reason: string;
    status: LeaveRequestStatus;
    createdAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
    rejectReason?: string;
}

export interface CreateLeaveRequestDTO {
    requesterType: "student" | "teacher";
    sessionId: number;
    type: LeaveRequestType;
    reason: string;
}

export interface LeaveQueryParams {
    status?: LeaveRequestStatus | "all";
    type?: LeaveRequestType | "all";
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const LEAVE_STATUS_LABELS: Record<LeaveRequestStatus, string> = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
};

export const LEAVE_TYPE_LABELS: Record<LeaveRequestType, string> = {
    leave: "Xin nghỉ",
    late: "Xin đến muộn",
};
