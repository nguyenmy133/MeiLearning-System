import { apiClient } from "@/lib/api-client";
import type { StudentLeaveRequest, LeaveQueryParams, ReviewLeaveDTO } from "../types";

export async function getLeaveRequests(teacherId?: number, params?: LeaveQueryParams): Promise<StudentLeaveRequest[]> {
  const { data } = await apiClient.get("/leave", { params: { teacherId, ...params } });
  return data;
}

export async function getLeaveStats(teacherId?: number): Promise<{ total: number; pending: number; approved: number; rejected: number }> {
  const { data } = await apiClient.get("/leave/stats", { params: { teacherId } });
  return data;
}

export async function approveLeaveRequest(id: string): Promise<StudentLeaveRequest> {
  const { data } = await apiClient.patch(`/leave/${id}/approve`);
  return data;
}

export async function rejectLeaveRequest(id: string, reason: string): Promise<StudentLeaveRequest> {
  const { data } = await apiClient.patch(`/leave/${id}/reject`, { reason });
  return data;
}
