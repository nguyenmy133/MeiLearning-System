export interface QRSettings {
  id?: number;
  enabled: boolean;
  expiryMinutes: number;
  lateThresholdMinutes: number;
  allowRegenerate: boolean;
}
