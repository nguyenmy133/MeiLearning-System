import { apiClient } from "@/lib/api-client";
import type { TuitionInvoice } from "../types";
import { MOCK_INVOICES } from "../data/mockData";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export async function getMyInvoices(): Promise<TuitionInvoice[]> {
  try {
    const { data } = await apiClient.get("/tuition");
    if (Array.isArray(data) && data.length > 0) return data;
  } catch { /* fallback */ }
  return clone(MOCK_INVOICES);
}

export async function getInvoiceById(id: string): Promise<TuitionInvoice> {
  try {
    const { data } = await apiClient.get(`/tuition/${id}`);
    return data;
  } catch { /* fallback */ }
  const inv = MOCK_INVOICES.find((i) => i.id === id);
  if (!inv) throw new Error("Không tìm thấy hóa đơn");
  return clone(inv);
}

export async function initiatePayment(invoiceId: string, method: string): Promise<TuitionInvoice> {
  try {
    const { data } = await apiClient.post(`/tuition/${invoiceId}/pay`, { paymentMethod: method });
    return data;
  } catch { /* fallback */ }
  const inv = MOCK_INVOICES.find((i) => i.id === invoiceId);
  if (!inv) throw new Error("Không tìm thấy hóa đơn");
  return { ...clone(inv), status: "reviewing" };
}
