export type RequestType = "reschedule" | "cancel";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface RescheduleRequest {
  id: string;
  classId: number;          // FK → Class.id (numeric)
  sessionId: number | null; // FK → ScheduledSession.id (null nếu request tổng quát)
  teacherId: number;
  teacherName: string;
  teacherAvatar: string;
  type: RequestType;
  className: string;
  originalDate: string;
  originalTime: string;
  requestedDate: string;
  requestedTime: string;
  requestedEndTime?: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy: string | null; // Tên admin xét duyệt
  rejectReason?: string;
}

export interface RescheduleStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
