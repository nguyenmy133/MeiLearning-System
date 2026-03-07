import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  /** Optional sub-label shown below the trend (dùng ở Reports page) */
  sub?: string;
}

/**
 * Shared KPI card hiển thị một chỉ số tổng quan với icon, giá trị và xu hướng.
 * Được dùng chung cho AdminDashboard và AdminReportsPage.
 */
export function StatCard({ label, value, change, trend, icon: Icon, sub }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <div
          className={`flex items-center gap-1 mt-1 text-xs ${
            trend === "up" ? "text-primary" : "text-destructive"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{change}</span>
        </div>
        {sub && (
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}
