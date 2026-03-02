import { QRSettings } from "../types";
import { mockQRSettings } from "../data/mockData";

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function randomDelay(min = 300, max = 700): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
  );
}

let db: QRSettings = clone(mockQRSettings);

export async function getQRSettings(): Promise<QRSettings> {
  await randomDelay(200, 400);
  return clone(db);
}

export async function updateQRSettings(settings: QRSettings): Promise<void> {
  await randomDelay();
  if (settings.expiryTime < 1 || settings.expiryTime > 30)
    throw new Error("Thời gian hiệu lực QR phải từ 1–30 phút");
  if (settings.lateThreshold < 5 || settings.lateThreshold > 60)
    throw new Error("Ngưỡng đi muộn phải từ 5–60 phút");
  db = clone(settings);
}
