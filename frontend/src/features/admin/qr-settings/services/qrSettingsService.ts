import { apiClient } from "@/lib/api-client";

export async function getQRSettings() {
  // TODO: QR settings endpoint not yet on backend
  return { enabled: true, expiryMinutes: 5 };
}

export async function updateQRSettings(dto: { enabled?: boolean; expiryMinutes?: number }) {
  // TODO: QR settings endpoint not yet on backend
  return dto;
}

