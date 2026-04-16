export type RescheduleStatus = "pending" | "approved" | "rejected";
export type RescheduleType = "reschedule" | "cancel";

export interface RescheduleRequest {
    id: string;
    teacherId: number;
    type: RescheduleType;
    classId: number;
    className: string;
    originalDate: string;       // "DD/MM/YYYY"
    originalTime: string;       // "HH:MM - HH:MM"
    requestedDate: string;
    requestedTime: string;
    requestedEndTime?: string;
    reason: string;
    status: RescheduleStatus;
    createdAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
    rejectReason?: string;
}

export interface CreateRescheduleDTO {
    type: RescheduleType;
    classId: number;
    sessionId?: number;
    originalDate: string;
    originalTime: string;
    requestedDate?: string;
    requestedTime?: string;
    requestedEndTime?: string;
    reason: string;
}

export interface RescheduleQueryParams {
    status?: RescheduleStatus | "all";
    classId?: number;
}

export const RESCHEDULE_STATUS_LABELS: Record<RescheduleStatus, string> = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
};

export const RESCHEDULE_TYPE_LABELS: Record<RescheduleType, string> = {
    reschedule: "Đổi lịch",
    cancel: "Hủy buổi",
};
