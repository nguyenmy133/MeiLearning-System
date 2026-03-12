import { apiClient } from "@/lib/api-client";
import type { RescheduleRequest, CreateRescheduleDTO, RescheduleQueryParams } from "../types";

export async function getRescheduleRequests(teacherId?: number, params?: RescheduleQueryParams): Promise<RescheduleRequest[]> {
  const { data } = await apiClient.get("/reschedule", { params: { teacherId, ...params } });
  return data;
}

export async function createRescheduleRequest(teacherId: number, dto: CreateRescheduleDTO): Promise<RescheduleRequest> {
  const { data } = await apiClient.post("/reschedule", { ...dto, teacherId });
  return data;
}
