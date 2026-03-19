import { apiClient } from "@/lib/api-client";
import type { RescheduleRequest, CreateRescheduleDTO, RescheduleQueryParams } from "../types";

/**
 * Lấy danh sách yêu cầu đổi lịch của teacher đang đăng nhập.
 * GET /reschedule/teacher/me — backend resolve từ JWT, KHÔNG cần teacherId.
 */
export async function getRescheduleRequests(
  _teacherId?: number,
  params?: RescheduleQueryParams
): Promise<RescheduleRequest[]> {
  const { data } = await apiClient.get("/reschedule/teacher/me", {
    params: params ? { status: params.status } : undefined,
  });
  if (!Array.isArray(data)) return data?.data ?? [];
  return data;
}

/**
 * Tạo yêu cầu đổi lịch.
 * POST /reschedule/teacher/me — backend resolve teacherId từ JWT.
 * FE không cần gửi teacherId.
 */
export async function createRescheduleRequest(
  _teacherId: number,
  dto: CreateRescheduleDTO
): Promise<RescheduleRequest> {
  const { data } = await apiClient.post("/reschedule/teacher/me", dto);
  return data;
}
