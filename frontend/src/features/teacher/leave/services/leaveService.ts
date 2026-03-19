import { apiClient } from "@/lib/api-client";
import type { StudentLeaveRequest, LeaveQueryParams, ReviewLeaveDTO } from "../types";

export async function getLeaveRequests(
  _teacherId?: number,
  params?: LeaveQueryParams
): Promise<StudentLeaveRequest[]> {
  // Gọi /leave/teacher/me — backend tự resolve teacher từ JWT
  const { data } = await apiClient.get("/leave/teacher/me", {
    params: params ? { status: params.status } : undefined,
  });
  return Array.isArray(data) ? data : (data?.data ?? []);
}

export async function getLeaveStats(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}> {
  try {
    // GET /leave/stats?requesterType=student — thống kê đơn của học viên trong lớp thầy
    const { data } = await apiClient.get("/leave/stats", {
      params: { requesterType: "student" },
    });
    return {
      total: data.total ?? 0,
      pending: data.pending ?? 0,
      approved: data.approved ?? 0,
      rejected: data.rejected ?? 0,
    };
  } catch {
    return { total: 0, pending: 0, approved: 0, rejected: 0 };
  }
}

/** Duyệt đơn — backend resolve reviewer từ JWT, không cần truyền reviewerId */
export async function approveLeaveRequest(id: string): Promise<StudentLeaveRequest> {
  const { data } = await apiClient.patch(`/leave/${id}/approve`);
  return data;
}

/**
 * Từ chối đơn — reason truyền qua query param (theo backend API mới).
 * Backend resolve reviewer từ JWT.
 */
export async function rejectLeaveRequest(
  id: string,
  _teacherId: number,
  dto: ReviewLeaveDTO
): Promise<StudentLeaveRequest> {
  const { data } = await apiClient.patch(`/leave/${id}/reject`, null, {
    params: { reason: dto.rejectReason },
  });
  return data;
}
