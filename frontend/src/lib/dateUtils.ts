/**
 * Tiện ích format ngày giờ — thống nhất toàn dự án.
 *
 * Format chuẩn: dd/MM/yyyy HH:mm
 * Ví dụ:        20/03/2026 10:00
 */

/** Pad số thành 2 chữ số: 1 → "01" */
const pad = (n: number): string => String(n).padStart(2, "0");


export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return String(value);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}


export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return String(value);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}


export function formatTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return String(value);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
