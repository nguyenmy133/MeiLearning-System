export type LeaveRequestStatus = "pending" | "approved" | "rejected";
export type LeaveRequestType = "leave" | "late";

export interface StudentLeaveRequest {
    id: string;
    requesterId: number;
    requesterName: string;
    requesterType: string;
    sessionId?: number;
    sessionDate?: string;
    className?: string;
    startTime?: string;
    endTime?: string;
    type: LeaveRequestType;
    reason: string;
    status: LeaveRequestStatus;
    createdAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
    rejectReason?: string;
}

export interface ReviewLeaveDTO {
    rejectReason?: string;  // required only when rejecting
}

export interface LeaveQueryParams {
    classId?: string | "all";
    status?: LeaveRequestStatus | "all";
    type?: LeaveRequestType | "all";
    search?: string;
}

export interface LeaveStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export const LEAVE_STATUS_LABELS: Record<LeaveRequestStatus, string> = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
};

export const LEAVE_TYPE_LABELS: Record<LeaveRequestType, string> = {
    leave: "Xin nghỉ",
    late: "Xin đến muộn",
};
