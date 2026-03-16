import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";

export async function getTuitionInvoices(params?: { status?: string; month?: string; studentId?: number }) {
  const { data } = await apiClient.get(API.TUITION.LIST, { params });
  // Backend returns PageResponse { data: [...], total, page, limit, totalPages }
  return Array.isArray(data) ? data : data?.data ?? [];
}

export async function getTuitionById(id: number) {
  const { data } = await apiClient.get(API.TUITION.DETAIL(id));
  return data;
}

export async function getTuitionByStudent(studentId: number) {
  const { data } = await apiClient.get(`/tuition/student/${studentId}`);
  return data;
}

export async function createTuition(dto: { studentId: number; classId: number; month: string; discountAmount?: number; discountReason?: string }) {
  const { data } = await apiClient.post(API.TUITION.LIST, dto);
  return data;
}

export async function generateMonthlyInvoices(month: string) {
  const { data } = await apiClient.post("/tuition/generate", null, { params: { month } });
  return data;
}

export async function payTuition(id: number, dto: { paymentMethod: string; paymentProofUrl?: string }) {
  const { data } = await apiClient.post(`/tuition/${id}/pay`, dto);
  return data;
}

export async function confirmTuition(id: number) {
  const { data } = await apiClient.patch(`/tuition/${id}/confirm`);
  return data;
}

export async function rejectTuition(id: number) {
  const { data } = await apiClient.patch(`/tuition/${id}/reject`);
  return data;
}

export async function getOverdueInvoices() {
  const { data } = await apiClient.get("/tuition/overdue");
  return data;
}

export async function getTuitionStats(month?: string) {
  const { data } = await apiClient.get("/tuition/stats", { params: { month } });
  return data;
}

// ── Aliased exports expected by hooks ─────────────────────────────────────────

export const getInvoices = getTuitionInvoices;

export async function approveInvoice(id: string) {
  const { data } = await apiClient.patch(`/tuition/${id}/confirm`);
  return data;
}

export async function confirmCashPayment(id: string) {
  const { data } = await apiClient.post(`/tuition/${id}/pay`, { paymentMethod: "cash" });
  return data;
}
