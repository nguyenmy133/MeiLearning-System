import { apiClient } from "@/lib/api-client";
import type { UserLeaveRequest, CreateLeaveRequestDTO, LeaveQueryParams } from "../types";

export async function getMyLeaveRequests(params?: LeaveQueryParams): Promise<UserLeaveRequest[]> {
  const { data } = await apiClient.get("/leave/my", { params });
  return data;
}

export async function createLeaveRequest(dto: CreateLeaveRequestDTO): Promise<UserLeaveRequest> {
  const { data } = await apiClient.post("/leave", dto);
  return data;
}

export async function cancelLeaveRequest(id: string): Promise<void> {
  await apiClient.patch(`/leave/${id}/cancel`);
}
