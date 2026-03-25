import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserX,
  UserCheck,
  CalendarCheck,
  DollarSign,
} from "lucide-react";
import { StatCard } from "@/features/admin/components/StatCard";
import { ChartTooltip } from "@/features/admin/components/ChartTooltip";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "../hooks";
import type { SessionStatus } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; color: string; dot: string }
> = {
  completed: {
    label: "Đã xong",
    color: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  ongoing: {
    label: "Đang diễn ra",
    color: "bg-primary/10 text-primary",
    dot: "bg-primary animate-pulse",
  },
  upcoming: {
    label: "Sắp diễn ra",
    color: "bg-accent text-accent-foreground",
    dot: "bg-secondary",
  },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-56" />
        <Skeleton className="h-56" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { data, isLoading } = useDashboardData();
  const navigate = useNavigate();

  if (isLoading || !data) return <PageSkeleton />;

  const { stats, revenueData, todaySchedule, todayAttendance, alerts, overdueStudents } =
    data;

  const displayStats = [
    { ...stats[0], icon: Users },
    { ...stats[1], icon: GraduationCap },
    { ...stats[2], icon: BookOpen },
    { ...stats[3], icon: CreditCard },
  ];

  const attendanceRate = todayAttendance.total > 0
    ? Math.round((todayAttendance.present / todayAttendance.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
            sub="so với tháng trước"
          />
        ))}
      </div>

      {/* ── Revenue chart + Attendance today ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue area chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Doanh thu 7 ngày qua (triệu đồng)
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Tuần này
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart
                data={revenueData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance today */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" />
              Điểm danh hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-2">
              <p className="text-4xl font-bold text-foreground">
                {todayAttendance.present}
                <span className="text-xl text-muted-foreground font-normal">
                  /{todayAttendance.total}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Học viên có mặt
              </p>
              <Progress value={attendanceRate} className="mt-3 h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Tỉ lệ:{" "}
                <span className="font-semibold text-primary">
                  {attendanceRate}%
                </span>
              </p>
            </div>

            <div className="space-y-2">
              {[
                {
                  icon: UserCheck,
                  label: "Có mặt",
                  value: todayAttendance.present,
                  color: "text-primary",
                },
                {
                  icon: Clock,
                  label: "Đi muộn",
                  value: todayAttendance.late,
                  color: "text-secondary-foreground",
                },
                {
                  icon: UserX,
                  label: "Vắng mặt",
                  value: todayAttendance.absent,
                  color: "text-destructive",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/40"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                  <span className={`text-sm font-semibold ${item.color}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Today schedule + Alerts ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Lịch học hôm nay
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => navigate("/admin/schedule")}>
              Xem lịch <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {todaySchedule.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Không có lịch học hôm nay</p>
            ) : todaySchedule.map((session) => {
              const cfg = SESSION_STATUS_CONFIG[session.status];
              return (
                <div
                  key={session.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    session.status === "ongoing"
                      ? "bg-primary/5 border border-primary/20"
                      : "bg-accent/40"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.class}
                      </p>
                      <Badge className={`${cfg.color} border-0 text-xs py-0`}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {session.time} · {session.teacher} · {session.room}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-xs">{session.students}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Alerts + Overdue tuition */}
        <div className="space-y-5">
          {/* Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-secondary" />
                Cảnh báo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Không có cảnh báo nào</p>
              ) : alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    alert.type === "warning"
                      ? "bg-secondary/15"
                      : "bg-accent/50"
                  }`}
                >
                  <p className="text-sm text-foreground">{alert.message}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary text-xs flex-shrink-0"
                    onClick={() => alert.link && navigate(alert.link)}
                  >
                    {alert.action}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Overdue tuition */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-destructive" />
                Học phí quá hạn
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => navigate("/admin/tuition")}>
                Xem tất cả <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {overdueStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Không có học phí quá hạn</p>
              ) : overdueStudents.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/5"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {s.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.class} · Quá hạn {s.days} ngày
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-destructive">
                    {s.amount}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
