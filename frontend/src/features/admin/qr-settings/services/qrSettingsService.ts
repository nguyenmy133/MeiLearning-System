import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export async function getQRSettings() {
  const { data } = await apiClient.get(API_ENDPOINTS.QR_SETTINGS.GET);
  return data;
}

export async function updateQRSettings(dto: { enabled?: boolean; expiryMinutes?: number }) {
  const { data } = await apiClient.put(API_ENDPOINTS.QR_SETTINGS.UPDATE, dto);
  return data;
}
