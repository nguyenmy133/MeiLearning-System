import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  BookOpen,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const revenueByMonth = [
  { month: "T7", revenue: 68 },
  { month: "T8", revenue: 72 },
  { month: "T9", revenue: 65 },
  { month: "T10", revenue: 80 },
  { month: "T11", revenue: 88 },
  { month: "T12", revenue: 95 },
];

const attendanceByClass = [
  { class: "Toán 12 LT", rate: 94, students: 22 },
  { class: "Anh Văn B1", rate: 91, students: 15 },
  { class: "Toán 10A", rate: 89, students: 18 },
  { class: "Hóa 11", rate: 85, students: 12 },
  { class: "Văn 12", rate: 83, students: 20 },
  { class: "Tiếng Anh SP", rate: 79, students: 14 },
  { class: "Lý 10A", rate: 76, students: 16 },
  { class: "Tin Học CB", rate: 72, students: 10 },
];

const studentsBySubject = [
  { name: "Toán", value: 320, color: "hsl(var(--primary))" },
  { name: "Tiếng Anh", value: 245, color: "hsl(var(--secondary))" },
  { name: "Văn", value: 180, color: "#8b5cf6" },
  { name: "Hóa Học", value: 142, color: "#f59e0b" },
  { name: "Vật Lý", value: 118, color: "#10b981" },
  { name: "Tin Học", value: 95, color: "#ec4899" },
  { name: "Khác", value: 134, color: "#6b7280" },
];

const enrollmentTrend = [
  { month: "T7", students: 198 },
  { month: "T8", students: 210 },
  { month: "T9", students: 205 },
  { month: "T10", students: 220 },
  { month: "T11", students: 232 },
  { month: "T12", students: 245 },
];

const absentStudents = [
  { name: "Phạm Thị Dung", class: "Văn 12", absences: 7, trend: "up" },
  { name: "Trần Minh Khoa", class: "Hóa 11", absences: 5, trend: "up" },
  { name: "Nguyễn Văn An", class: "Toán 10A", absences: 4, trend: "stable" },
  { name: "Hoàng Thị Lan", class: "Lý 10A", absences: 4, trend: "down" },
  { name: "Lê Quang Minh", class: "Tiếng Anh SP", absences: 3, trend: "stable" },
];

const tuitionSummary = {
  collected: 85000000,
  pending: 12500000,
  overdue: 4500000,
  total: 102000000,
};

const MONTHS = [
  "Tháng 7/2024", "Tháng 8/2024", "Tháng 9/2024",
  "Tháng 10/2024", "Tháng 11/2024", "Tháng 12/2024",
];

// ─── Custom tooltips ──────────────────────────────────────────────────────────

const RevenueTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-semibold text-foreground">{payload[0].value}M ₫</p>
      </div>
    );
  }
  return null;
};

const EnrollmentTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{payload[0].value} học viên</p>
      </div>
    );
  }
  return null;
};

// ─── Overview stats ───────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${(n / 1000).toFixed(0)}K`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState("Tháng 12/2024");
  const [selectedTab, setSelectedTab] = useState<"revenue" | "attendance" | "students">("revenue");

  const tuitionRate = Math.round((tuitionSummary.collected / tuitionSummary.total) * 100);
  const avgAttendance = Math.round(
    attendanceByClass.reduce((s, c) => s + c.rate, 0) / attendanceByClass.length
  );

  const overviewStats = [
    {
      label: "Doanh thu tháng",
      value: "95M ₫",
      change: "+7.9%",
      trend: "up",
      icon: CreditCard,
      sub: "Mục tiêu: 85M ₫",
    },
    {
      label: "Học viên đang học",
      value: "245",
      change: "+5.6%",
      trend: "up",
      icon: Users,
      sub: "So với tháng trước",
    },
    {
      label: "Tỉ lệ điểm danh TB",
      value: `${avgAttendance}%`,
      change: "-1.2%",
      trend: "down",
      icon: BookOpen,
      sub: "Trung bình tất cả lớp",
    },
    {
      label: "Tỉ lệ thu học phí",
      value: `${tuitionRate}%`,
      change: "+4%",
      trend: "up",
      icon: GraduationCap,
      sub: `Còn lại: ${formatCurrency(tuitionSummary.pending + tuitionSummary.overdue)} ₫`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground">Báo cáo & Phân tích</h2>
          <p className="text-sm text-muted-foreground">Tổng hợp dữ liệu hoạt động của trung tâm</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <div className={`flex items-center gap-1 mt-1 text-xs ${stat.trend === "up" ? "text-primary" : "text-destructive"}`}>
                {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{stat.change}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab switch */}
      <div className="flex gap-2 border-b border-border pb-1">
        {(["revenue", "attendance", "students"] as const).map((tab) => {
          const labels = { revenue: "Doanh thu", attendance: "Điểm danh", students: "Học viên" };
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

      {/* ── Tab: Doanh thu ── */}
      {selectedTab === "revenue" && (
        <div className="space-y-6">
          {/* Revenue bar chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Doanh thu 6 tháng gần nhất (triệu đồng)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueByMonth} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Bar dataKey="revenue" name="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

            </CardContent>
          </Card>

          {/* Tuition breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Tình trạng thu học phí — {selectedMonth}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Đã thu", value: tuitionSummary.collected, color: "text-primary", bg: "bg-primary/10", icon: CheckCircle2 },
                  { label: "Chờ thu", value: tuitionSummary.pending, color: "text-secondary-foreground", bg: "bg-secondary/20", icon: BookOpen },
                  { label: "Quá hạn", value: tuitionSummary.overdue, color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle },
                ].map((item) => (
                  <div key={item.label} className={`rounded-lg p-4 ${item.bg}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                    <p className={`text-xl font-bold ${item.color}`}>{formatCurrency(item.value)}₫</p>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tiến độ thu ({tuitionRate}%)</span>
                  <span>{formatCurrency(tuitionSummary.collected)}₫ / {formatCurrency(tuitionSummary.total)}₫</span>
                </div>
                <Progress value={tuitionRate} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab: Điểm danh ── */}
      {selectedTab === "attendance" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Tỉ lệ điểm danh theo lớp — {selectedMonth}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {attendanceByClass.map((cls) => (
                <div key={cls.class} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{cls.class}</span>
                      <Badge variant="outline" className="text-xs">{cls.students} HV</Badge>
                    </div>
                    <span className={`text-sm font-semibold ${
                      cls.rate >= 90 ? "text-primary" :
                      cls.rate >= 80 ? "text-secondary-foreground" :
                      "text-destructive"
                    }`}>{cls.rate}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        cls.rate >= 90 ? "bg-primary" :
                        cls.rate >= 80 ? "bg-secondary" :
                        "bg-destructive"
                      }`}
                      style={{ width: `${cls.rate}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-2 border-t border-border">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-primary" /><span className="text-xs text-muted-foreground">≥ 90% (tốt)</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-secondary" /><span className="text-xs text-muted-foreground">≥ 80% (khá)</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-destructive" /><span className="text-xs text-muted-foreground">&lt; 80% (cần chú ý)</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Most absent students */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-secondary" />
                Học viên vắng nhiều nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {absentStudents.map((s, idx) => (
                  <div key={s.name} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? "bg-destructive/20 text-destructive" :
                        idx === 1 ? "bg-secondary/30 text-secondary-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}>{idx + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.class}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`border-0 ${
                        s.absences >= 5 ? "bg-destructive/10 text-destructive" :
                        "bg-secondary/20 text-secondary-foreground"
                      }`}>
                        {s.absences} buổi vắng
                      </Badge>
                      {s.trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-destructive" />}
                      {s.trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-primary" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab: Học viên ── */}
      {selectedTab === "students" && (
        <div className="space-y-6">
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
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={enrollmentTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[180, 260]} />
                    <Tooltip content={<EnrollmentTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={studentsBySubject}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {studentsBySubject.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value} học viên`, ""]}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Class capacity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Sĩ số theo lớp (học viên đang học)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={attendanceByClass}
                  layout="vertical"
                  margin={{ top: 0, right: 40, left: 60, bottom: 0 }}
                  barSize={14}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="class" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip
                    formatter={(value: number) => [`${value} học viên`, "Sĩ số"]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Bar dataKey="students" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
