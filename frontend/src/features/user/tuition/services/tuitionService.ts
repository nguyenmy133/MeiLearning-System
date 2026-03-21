import { apiClient } from "@/lib/api-client";
import type { TuitionInvoice } from "../types";

/** Get invoices for current student — uses JWT-resolved /me endpoint */
export async function getMyInvoices(month?: string): Promise<TuitionInvoice[]> {
  const { data } = await apiClient.get("/tuition/me", {
    params: month ? { month } : undefined,
  });
  if (Array.isArray(data)) return data;
  return [];
}

export async function getInvoiceById(id: string): Promise<TuitionInvoice> {
  const { data } = await apiClient.get(`/tuition/${id}`);
  return data;
}

export async function initiatePayment(payload: { invoiceId: string; amount: number }, method = "qr_transfer"): Promise<TuitionInvoice> {
  const { data } = await apiClient.post(`/tuition/${payload.invoiceId}/pay`, { paymentMethod: method });
  return data;
}
