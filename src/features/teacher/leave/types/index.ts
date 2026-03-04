export type LeaveRequestStatus = "pending" | "approved" | "rejected";
export type LeaveRequestType = "leave" | "late";

export interface StudentLeaveRequest {
    id: string;
    studentId: string;
    studentName: string;
    avatar?: string;
    classId: string;
    className: string;
    type: LeaveRequestType;
    date: string;           // "DD/MM/YYYY"
    sessionTime: string;    // "HH:MM - HH:MM"
    reason: string;
    status: LeaveRequestStatus;
    createdAt: string;
    reviewedAt?: string;
    reviewedById?: number;  // teacher or admin ID who reviewed
    rejectReason?: string;
    totalAbsences: number;  // total absences this month for this student
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
