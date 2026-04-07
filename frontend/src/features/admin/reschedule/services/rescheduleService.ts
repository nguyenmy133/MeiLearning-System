import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";

import type { PaginatedResponse } from "@/types";

export async function getRescheduleRequests(params?: any): Promise<PaginatedResponse<any>> {
  const { data } = await apiClient.get(API.RESCHEDULE.LIST, { params });
  if (Array.isArray(data)) {
    return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
  }
  return data;
}

export async function getRescheduleByTeacher(teacherId: number) {
  const { data } = await apiClient.get(`/reschedule/teacher/${teacherId}`);
  return data;
}

export async function createRescheduleRequest(dto: {
  teacherId: number;
  classId: number;
  sessionId?: number;
  type: string;
  originalDate: string;
  originalTime?: string;
  requestedDate?: string;
  requestedTime?: string;
  reason: string;
}) {
  const { data } = await apiClient.post(API.RESCHEDULE.CREATE, dto);
  return data;
}

export async function approveReschedule(id: number, reviewedBy: string) {
  const { data } = await apiClient.patch(API.RESCHEDULE.APPROVE(id), null, {
    params: { reviewedBy },
  });
  return data;
}

export async function rejectReschedule(id: number, reviewedBy: string, reason: string) {
  const { data } = await apiClient.patch(API.RESCHEDULE.REJECT(id), null, {
    params: { reviewedBy, reason },
  });
  return data;
}

// ── Aliased exports expected by hooks ─────────────────────────────────────────

export const getRequests = getRescheduleRequests;

export async function getStats() {
  const response = await getRescheduleRequests({ page: 1, limit: 10000 });
  const requests = response.data ?? [];
  if (!Array.isArray(requests)) return { total: 0, pending: 0, approved: 0, rejected: 0 };
  return {
    total: requests.length,
    pending: requests.filter((r: any) => r.status === "pending").length,
    approved: requests.filter((r: any) => r.status === "approved").length,
    rejected: requests.filter((r: any) => r.status === "rejected").length,
  };
}

export async function approveRequest(id: string, reviewedBy: string) {
  const { data } = await apiClient.patch(API.RESCHEDULE.APPROVE(Number(id)), null, {
    params: { reviewedBy },
  });
  return data;
}

export async function rejectRequest(id: string, reviewedBy: string, reason: string) {
  const { data } = await apiClient.patch(API.RESCHEDULE.REJECT(Number(id)), null, {
    params: { reviewedBy, reason },
  });
  return data;
}
