// ─── Leave Request Types ──────────────────────────────────────────────────────
// Business rule: Teacher is the one who reviews leave requests.
// Excused absence (approved leave) = not billed.

export type LeaveRequestStatus = "pending" | "approved" | "rejected";
export type LeaveRequestType = "leave" | "late";

export interface UserLeaveRequest {
    id: string;
    classId: string;
    className: string;
    type: LeaveRequestType;
    /** Date of the session to be absent. Format: "YYYY-MM-DD" */
    sessionDate: string;
    sessionTime: string;      // "HH:MM - HH:MM"
    reason: string;
    status: LeaveRequestStatus;
    createdAt: string;
    /** Teacher who reviewed this request */
    reviewedByName?: string;
    reviewedAt?: string;
    /** Reason only filled when rejected */
    rejectReason?: string;
}

export interface CreateLeaveRequestDTO {
    classId: string;
    type: LeaveRequestType;
    /** Must be at least 24h in the future */
    sessionDate: string;
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
