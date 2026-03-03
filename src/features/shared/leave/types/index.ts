/**
 * ============================================================================
 * SHARED LEAVE SERVICE — TYPE DEFINITIONS
 * ============================================================================
 * Dùng chung cho cả Teacher và User (học viên).
 * - Teacher gửi đơn nghỉ dạy → Admin xét duyệt → lịch tự động cập nhật
 * - User gửi đơn nghỉ học → Giáo viên / Admin xét duyệt
 * ============================================================================
 */

export type LeaveRole = "teacher" | "student";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveType = "sick" | "personal" | "emergency" | "other";

export interface LeaveRequest {
  id: string;
  /** Người gửi đơn */
  requesterId: number;
  requesterName: string;
  requesterAvatar: string;
  requesterRole: LeaveRole;
  /** Lớp / buổi liên quan */
  classId: string;
  className: string;
  sessionId?: number; // null nếu nghỉ cả ngày
  leaveDate: string; // "YYYY-MM-DD"
  leaveType: LeaveType;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string | null;
  rejectReason?: string;
}

export interface LeaveStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface CreateLeaveDTO {
  requesterId: number;
  requesterName: string;
  requesterAvatar: string;
  requesterRole: LeaveRole;
  classId: string;
  className: string;
  sessionId?: number;
  leaveDate: string;
  leaveType: LeaveType;
  reason: string;
}

export interface LeaveQueryParams {
  requesterId?: number;
  requesterRole?: LeaveRole;
  classId?: string;
  status?: LeaveStatus;
}

// ── Label maps ────────────────────────────────────────────────────────────────

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  sick: "Ốm / bệnh",
  personal: "Việc cá nhân",
  emergency: "Khẩn cấp",
  other: "Lý do khác",
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};
