/**
 * Custom tooltip dùng chung cho tất cả recharts charts trong admin.
 * Thay thế các CustomTooltip / RevenueTooltip / EnrollmentTooltip inline.
 *
 * @param unit - Đơn vị hiển thị sau giá trị, vd: "M ₫", "học viên"
 */
export interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  /** Đơn vị hiển thị sau số, mặc định là "M ₫" */
  unit?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  unit = "M ₫",
}: ChartTooltipProps) {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-semibold text-foreground">
          {payload[0].value} {unit}
        </p>
      </div>
    );
  }
  return null;
}
