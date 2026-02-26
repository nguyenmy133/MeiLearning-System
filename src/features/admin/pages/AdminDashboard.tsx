import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  TrendingUp,
  TrendingDown,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserX,
  UserCheck,
  CalendarCheck,
  DollarSign,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const stats = [
  {
    label: "Tổng học viên",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: Users,
  },
  {
    label: "Giáo viên",
    value: "52",
    change: "+3",
    trend: "up",
    icon: GraduationCap,
  },
  {
    label: "Lớp đang mở",
    value: "48",
    change: "-2",
    trend: "down",
    icon: BookOpen,
  },
  {
    label: "Doanh thu tháng",
    value: "450M",
    change: "+8%",
    trend: "up",
    icon: CreditCard,
  },
];

const revenueData = [
  { day: "T2", revenue: 12.5 },
  { day: "T3", revenue: 8.2 },
  { day: "T4", revenue: 15.8 },
  { day: "T5", revenue: 11.3 },
  { day: "T6", revenue: 18.6 },
  { day: "T7", revenue: 22.1 },
  { day: "CN", revenue: 9.4 },
];

const todaySchedule = [
  {
    id: 1,
    time: "08:00 - 10:00",
    class: "Toán 10A",
    teacher: "Nguyễn Thị Mai",
    room: "Phòng 101",
    students: 18,
    status: "completed",
  },
  {
    id: 2,
    time: "14:00 - 16:00",
    class: "Tiếng Anh B1",
    teacher: "Trần Văn Hùng",
    room: "Phòng A2",
    students: 15,
    status: "ongoing",
  },
  {
    id: 3,
    time: "17:00 - 19:00",
    class: "Hóa 11",
    teacher: "Lê Thị Hương",
    room: "Phòng Lab 1",
    students: 12,
    status: "upcoming",
  },
  {
    id: 4,
    time: "18:00 - 20:00",
    class: "Toán 12 Luyện Thi",
    teacher: "Nguyễn Thị Mai",
    room: "Phòng 201",
    students: 22,
    status: "upcoming",
  },
  {
    id: 5,
    time: "19:00 - 21:00",
    class: "Văn 12",
    teacher: "Phạm Minh Tuấn",
    room: "Phòng 102",
    students: 20,
    status: "upcoming",
  },
];

const todayAttendance = {
  total: 67,
  present: 58,
  absent: 6,
  late: 3,
};

const alerts = [
  {
    type: "warning",
    message: "5 học viên vắng liên tiếp ≥ 3 buổi",
    action: "Xem danh sách",
  },
  {
    type: "info",
    message: "8 học viên chưa thanh toán học phí tháng này",
    action: "Xem danh sách",
  },
  {
    type: "warning",
    message: "3 lớp có tỉ lệ vắng cao (>20%)",
    action: "Xem báo cáo",
  },
];

const overdueStudents = [
  { name: "Phạm Thị Dung", class: "Văn 12", amount: "2.500.000đ", days: 12 },
  { name: "Trần Văn Khoa", class: "Toán 10A", amount: "2.000.000đ", days: 8 },
  { name: "Lê Minh Anh", class: "Hóa 11", amount: "1.800.000đ", days: 5 },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">
          {payload[0].value}M ₫
        </p>
      </div>
    );
  }
  return null;
};

// ─── Schedule status config ───────────────────────────────────────────────────

const scheduleStatusConfig = {
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

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const attendanceRate = Math.round(
    (todayAttendance.present / todayAttendance.total) * 100
  );

  return (
    <div className="space-y-6">
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div
                className={`flex items-center gap-1 mt-2 text-sm ${
                  stat.trend === "up" ? "text-primary" : "text-destructive"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
                <span className="text-muted-foreground">so với tháng trước</span>
              </div>
            </CardContent>
          </Card>
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
                <Tooltip content={<CustomTooltip />} />
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
            {/* Circle-like summary */}
            <div className="text-center py-2">
              <p className="text-4xl font-bold text-foreground">
                {todayAttendance.present}
                <span className="text-xl text-muted-foreground font-normal">
                  /{todayAttendance.total}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">Học viên có mặt</p>
              <Progress value={attendanceRate} className="mt-3 h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Tỉ lệ: <span className="font-semibold text-primary">{attendanceRate}%</span>
              </p>
            </div>

            {/* Breakdown */}
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
            <Button variant="ghost" size="sm" className="text-primary text-xs">
              Xem lịch <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {todaySchedule.map((session) => {
              const cfg =
                scheduleStatusConfig[
                  session.status as keyof typeof scheduleStatusConfig
                ];
              return (
                <div
                  key={session.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    session.status === "ongoing"
                      ? "bg-primary/5 border border-primary/20"
                      : "bg-accent/40"
                  }`}
                >
                  {/* Status dot */}
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`}
                  />
                  {/* Info */}
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
                  {/* Students count */}
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
              {alerts.map((alert, index) => (
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
              <Button
                variant="ghost"
                size="sm"
                className="text-primary text-xs"
              >
                Xem tất cả <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {overdueStudents.map((s) => (
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

      {/* ── Quick stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Buổi học hôm nay",
            value: todaySchedule.length,
            sub: `${todaySchedule.filter((s) => s.status === "completed").length} đã hoàn thành`,
            icon: CalendarCheck,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Lớp đang mở",
            value: 48,
            sub: "Đang hoạt động",
            icon: CalendarCheck,
            color: "text-secondary-foreground",
            bg: "bg-secondary/20",
          },
          {
            label: "Học phí quá hạn",
            value: 3,
            sub: "Học viên",
            icon: AlertTriangle,
            color: "text-destructive",
            bg: "bg-destructive/10",
          },
          {
            label: "Điểm danh hôm nay",
            value: todayAttendance.present,
            sub: `/${todayAttendance.total} học viên`,
            icon: CheckCircle2,
            color: "text-primary",
            bg: "bg-primary/10",
          },
        ].map((item) => (
          <Card key={item.label} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${item.color}`}>
                    {item.value}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {item.label}
                    <br />
                    <span className="text-muted-foreground/70">{item.sub}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
