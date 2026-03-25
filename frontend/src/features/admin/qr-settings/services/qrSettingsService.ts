import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";
import type { QRSettings } from "../types";

export async function getQRSettings(): Promise<QRSettings> {
  const { data } = await apiClient.get(API.QR_SETTINGS.GET);
  return data;
}

export async function updateQRSettings(dto: Partial<QRSettings>): Promise<QRSettings> {
  const { data } = await apiClient.put(API.QR_SETTINGS.UPDATE, dto);
  return data;
}
