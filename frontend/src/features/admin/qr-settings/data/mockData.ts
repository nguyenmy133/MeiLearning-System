import type { QRSettings } from "../types";

export const mockQRSettings: QRSettings = {
  enabled: true,
  expiryMinutes: 5,
  lateThresholdMinutes: 10,
  allowRegenerate: true,
};
