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
  ComposedChart,
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
import { StatCard } from "../components/StatCard";
import { ChartTooltip } from "../components/ChartTooltip";

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
  { class: "Toán 12 LT", rate: 94, students: 25, capacity: 25 }, // 100% full
  { class: "Anh Văn B1", rate: 91, students: 18, capacity: 20 }, // 90% full
  { class: "Toán 10A", rate: 89, students: 18, capacity: 25 }, // 72% OK
  { class: "Hóa 11", rate: 85, students: 12, capacity: 20 }, // 60% OK
  { class: "Văn 12", rate: 83, students: 20, capacity: 30 }, // 66% OK
  { class: "Tiếng Anh SP", rate: 79, students: 14, capacity: 15 }, // 93% full
  { class: "Lý 10A", rate: 76, students: 9, capacity: 20 }, // 45% low
  { class: "Tin Học CB", rate: 72, students: 5, capacity: 15 }, // 33% low
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

// ─── Custom tooltips → shared ChartTooltip ───────────────────────────────────

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
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            trend={stat.trend as "up" | "down"}
            icon={stat.icon}
            sub={stat.sub}
          />
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
                  <Tooltip content={<ChartTooltip unit="M ₫" />} />
                  <Bar dataKey="revenue" name="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={45} />
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
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Đã thu", value: tuitionSummary.collected, color: "text-primary", bg: "bg-primary/10", icon: CheckCircle2 },
                  { label: "Chờ thu", value: tuitionSummary.pending, color: "text-amber-500", bg: "bg-amber-500/10", icon: BookOpen },
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
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={attendanceByClass} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="class" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                    itemStyle={{ color: "hsl(var(--foreground))", fontSize: "14px", fontWeight: 500 }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar yAxisId="left" dataKey="students" name="Sĩ số" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Line yAxisId="right" type="monotone" dataKey="rate" name="Tỉ lệ %" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--card))", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
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
                    <Tooltip content={<ChartTooltip unit="học viên" />} />
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
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Tỉ lệ sĩ số lớp
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-5 border-b border-border pb-4 w-full">
                <div className="flex flex-col flex-1">
                  <span className="text-xl font-bold text-primary">3</span>
                  <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold tracking-wider whitespace-nowrap"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Sắp đầy (&gt;90%)</span>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-xl font-bold text-amber-500">3</span>
                  <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold tracking-wider whitespace-nowrap"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Ổn định</span>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-xl font-bold text-destructive">2</span>
                  <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold tracking-wider whitespace-nowrap"><div className="w-1.5 h-1.5 rounded-full bg-destructive" /> Cần ghép (&lt;50%)</span>
                </div>
              </div>

              <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                {[...attendanceByClass].sort((a,b) => (b.students/b.capacity) - (a.students/a.capacity)).map((cls) => {
                  const fillRate = Math.round((cls.students / cls.capacity) * 100);
                  const isFull = fillRate >= 90;
                  const isLow = fillRate < 50;
                  
                  return (
                    <div key={cls.class} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">{cls.class}</span>
                        <div className="flex gap-2 items-center">
                          <span className="text-muted-foreground text-xs">{cls.students}/{cls.capacity} HV</span>
                          {isFull && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">Tuyển đủ</Badge>}
                          {isLow && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-destructive/10 text-destructive border-destructive/20">Vắng</Badge>}
                        </div>
                      </div>
                      <div className="w-full bg-secondary/30 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${isFull ? 'bg-primary' : isLow ? 'bg-destructive' : 'bg-amber-500'}`} 
                          style={{ width: `${Math.min(fillRate, 100)}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
