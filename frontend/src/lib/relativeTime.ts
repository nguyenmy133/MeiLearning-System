/**
 * Relative time formatter — no external libs required.
 * Returns Vietnamese relative strings like "2 phút trước", "1 giờ trước".
 * Falls back to date+time string if input is invalid or missing.
 */
export function formatRelativeTime(
  isoString?: string,
  fallback?: string
): string {
  if (!isoString) return fallback ?? "";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return fallback ?? isoString;

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay === 1) return "Hôm qua";
  if (diffDay < 7) return `${diffDay} ngày trước`;

  // Older than a week → show formatted date
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
