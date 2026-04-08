import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  BookOpen,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/features/admin/components/StatCard";
import { ChartTooltip } from "@/features/admin/components/ChartTooltip";
import { useFinancialReport, useAcademicReport, useReportsOverview } from "../hooks";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${(n / 1000).toFixed(0)}K`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminReportsPage() {
  const [selectedTab, setSelectedTab] = useState<"financial" | "academic">(
    "financial"
  );

  const { data: overview, isLoading: loadingOverview } = useReportsOverview();
  const { data: financial, isLoading: loadingFinancial } = useFinancialReport();
  const { data: academic, isLoading: loadingAcademic } = useAcademicReport();

  const isLoading =
    loadingOverview ||
    (selectedTab === "financial" && loadingFinancial) ||
    (selectedTab === "academic" && loadingAcademic);

  if (isLoading && !overview && !financial && !academic) return <PageSkeleton />;

  // Derived stats computed from data
  const attendanceByClass = academic?.attendanceByClass ?? [];
  const avgAttendance =
    attendanceByClass.length > 0
      ? Math.round(
          attendanceByClass.reduce((s, c) => s + c.rate, 0) /
            attendanceByClass.length
        )
      : 0;

  const totalRevenue = overview?.tuition?.monthRevenue ?? 0;
  const overdueCount = overview?.tuition?.overdueCount ?? 0;
  const pendingCount = overview?.tuition?.pendingCount ?? 0;
  const activeStudents = overview?.students?.activeStudents ?? 0;
  const activeClasses = overview?.classes?.activeClasses ?? 0;

  const overviewStats = [
    {
      label: "Tổng Doanh Thu",
      value: totalRevenue > 0 ? `${formatCurrency(totalRevenue)} ₫` : "0 ₫",
      change: "",
      trend: "up" as const,
      icon: CreditCard,
      sub: "Lũy kế toàn hệ thống",
    },
    {
      label: "Công Nợ Hệ Thống",
      value: `${overdueCount + pendingCount} hóa đơn`,
      change: "",
      trend: overdueCount > 0 ? "down" as const : "up" as const,
      icon: AlertCircle,
      sub: "Chờ thu & Quá hạn",
    },
    {
      label: "Quy Mô Đào Tạo",
      value: `${activeStudents} HV`,
      change: "",
      trend: "up" as const,
      icon: Users,
      sub: `Trong ${activeClasses} lớp hoạt động`,
    },
    {
      label: "Tỉ lệ điểm danh TB",
      value: `${avgAttendance}%`,
      change: "",
      trend: avgAttendance >= 80 ? "up" as const : "down" as const,
      icon: BookOpen,
      sub: "Toàn trung tâm (Tháng hiện tại)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground">
            Báo cáo Vĩ mô & Phân tích
          </h2>
          <p className="text-sm text-muted-foreground">
            Dashboard Chỉ số Sức khoẻ Toàn hệ thống
          </p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
            sub={stat.sub}
          />
        ))}
      </div>

      {/* Tab switch */}
      <div className="flex gap-2 border-b border-border pb-1">
        {(["financial", "academic"] as const).map((tab) => {
          const labels = {
            financial: "Tổng quan Tài chính",
            academic: "Hiệu suất & Lớp học",
          };
          return (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition-colors ${
                selectedTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* ── Tab: Tài chính ── */}
      {selectedTab === "financial" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue bar chart */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Doanh thu 6 tháng gần nhất (triệu đồng)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingFinancial ? (
                <Skeleton className="h-[260px]" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={financial?.revenueByMonth}
                    margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                    barGap={4}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 12,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip unit="M ₫" />} />
                    <Bar
                      dataKey="revenue"
                      name="revenue"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Revenue by subject (pie) */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Cơ cấu doanh thu theo Khối/Môn
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingFinancial ? (
                <Skeleton className="h-[260px]" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={financial?.revenueBySubject}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(financial?.revenueBySubject ?? []).map(
                        (entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, ""]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span
                          style={{
                            fontSize: 12,
                            color: "hsl(var(--muted-foreground))",
                          }}
                        >
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab: Học thuật ── */}
      {selectedTab === "academic" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Class capacity */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Tỉ lệ sĩ số lớp
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAcademic ? (
                  <Skeleton className="h-[380px]" />
                ) : (
                  <>
                    <div className="flex gap-4 mb-5 border-b border-border pb-4 w-full">
                      <div className="flex flex-col flex-1">
                        <span className="text-xl font-bold text-primary">
                          {
                            attendanceByClass.filter(
                              (c) =>
                                Math.round((c.students / c.capacity) * 100) >=
                                90
                            ).length
                          }
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold tracking-wider whitespace-nowrap">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
                          Sắp đầy (&gt;90%)
                        </span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-xl font-bold text-amber-500">
                          {
                            attendanceByClass.filter((c) => {
                              const r = Math.round(
                                (c.students / c.capacity) * 100
                              );
                              return r >= 50 && r < 90;
                            }).length
                          }
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold tracking-wider whitespace-nowrap">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />{" "}
                          Ổn định
                        </span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-xl font-bold text-destructive">
                          {
                            attendanceByClass.filter(
                              (c) =>
                                Math.round((c.students / c.capacity) * 100) <
                                50
                            ).length
                          }
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold tracking-wider whitespace-nowrap">
                          <div className="w-1.5 h-1.5 rounded-full bg-destructive" />{" "}
                          Cần ghép (&lt;50%)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {[...attendanceByClass]
                        .sort(
                          (a, b) =>
                            b.students / b.capacity - a.students / a.capacity
                        )
                        .map((cls) => {
                          const fillRate = Math.round(
                            (cls.students / cls.capacity) * 100
                          );
                          const isFull = fillRate >= 90;
                          const isLow = fillRate < 50;
                          return (
                            <div key={cls.class} className="space-y-1.5">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-foreground">
                                  {cls.class}
                                </span>
                                <div className="flex gap-2 items-center">
                                  <span className="text-muted-foreground text-xs">
                                    {cls.students}/{cls.capacity} HV
                                  </span>
                                  {isFull && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20"
                                    >
                                      Tuyển đủ
                                    </Badge>
                                  )}
                                  {isLow && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 h-4 bg-destructive/10 text-destructive border-destructive/20"
                                    >
                                      Vắng
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="w-full bg-secondary/30 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isFull
                                      ? "bg-primary"
                                      : isLow
                                        ? "bg-destructive"
                                        : "bg-amber-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(fillRate, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Attendance by class chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Tỉ lệ điểm danh theo lớp — Tháng hiện tại
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAcademic ? (
                  <Skeleton className="h-[380px]" />
                ) : (
                  <ResponsiveContainer width="100%" height={380}>
                    <ComposedChart
                      data={academic?.attendanceByClass}
                      margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="class"
                        tick={{
                          fontSize: 11,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{
                          fontSize: 11,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                        tick={{
                          fontSize: 11,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        itemStyle={{
                          color: "hsl(var(--foreground))",
                          fontSize: "14px",
                          fontWeight: 500,
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="students"
                        name="Sĩ số"
                        fill="hsl(var(--secondary))"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="rate"
                        name="Tỉ lệ %"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: "hsl(var(--card))",
                          strokeWidth: 2,
                        }}
                        activeDot={{ r: 6 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Enrollment trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Xu hướng học viên 6 tháng
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAcademic ? (
                  <Skeleton className="h-[220px]" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                      data={academic?.enrollmentTrend}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{
                          fontSize: 12,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        axisLine={false}
                        tickLine={false}
                        domain={[180, 260]}
                      />
                      <Tooltip
                        content={<ChartTooltip unit="học viên" />}
                      />
                      <Line
                        type="monotone"
                        dataKey="students"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        dot={{
                          fill: "hsl(var(--primary))",
                          r: 4,
                          strokeWidth: 0,
                        }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Students by subject (pie) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Học viên theo môn học
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAcademic ? (
                  <Skeleton className="h-[220px]" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={academic?.studentsBySubject}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {(academic?.studentsBySubject ?? []).map(
                          (entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          )
                        )}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `${value} học viên`,
                          "",
                        ]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => (
                          <span
                            style={{
                              fontSize: 12,
                              color: "hsl(var(--muted-foreground))",
                            }}
                          >
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
