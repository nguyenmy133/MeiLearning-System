import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FileBarChart2,
  Plus,
  Search,
  Calendar,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  DollarSign,
  TrendingUp,
  BookOpen,
} from "lucide-react";

// Mock data for reports
const reports = [
  {
    id: "RP-2401",
    name: "Báo cáo doanh thu tháng 12",
    type: "Doanh thu",
    period: "01/12 - 31/12",
    status: "ready",
    createdBy: "Nguyễn Khoa",
    createdAt: "20/12/2024 09:30",
    format: "PDF",
  },
  {
    id: "RP-2402",
    name: "Tổng hợp điểm danh tuần 50",
    type: "Điểm danh",
    period: "09/12 - 15/12",
    status: "processing",
    createdBy: "Lê Thảo",
    createdAt: "19/12/2024 14:05",
    format: "XLSX",
  },
  {
    id: "RP-2403",
    name: "Báo cáo chất lượng giảng dạy Q4",
    type: "Chất lượng",
    period: "01/10 - 31/12",
    status: "scheduled",
    createdBy: "Trần Quang",
    createdAt: "18/12/2024 11:20",
    format: "PDF",
  },
  {
    id: "RP-2404",
    name: "Báo cáo học phí quá hạn",
    type: "Học phí",
    period: "Tháng 12",
    status: "failed",
    createdBy: "Nguyễn Khoa",
    createdAt: "17/12/2024 16:45",
    format: "CSV",
  },
];

// Mock data for analytics
const analyticsData = {
  overview: {
    totalStudents: 245,
    totalRevenue: 122500000,
    attendanceRate: 87.5,
    activeClasses: 18,
    trends: { students: 12.5, revenue: 8.3, attendance: 2.1, classes: 5.9 },
  },
  revenue: [
    { month: "2024-01", revenue: 98000000 },
    { month: "2024-02", revenue: 102000000 },
    { month: "2024-03", revenue: 105000000 },
    { month: "2024-04", revenue: 108000000 },
    { month: "2024-05", revenue: 110000000 },
    { month: "2024-06", revenue: 112000000 },
    { month: "2024-07", revenue: 115000000 },
    { month: "2024-08", revenue: 117000000 },
    { month: "2024-09", revenue: 118000000 },
    { month: "2024-10", revenue: 120000000 },
    { month: "2024-11", revenue: 121000000 },
    { month: "2024-12", revenue: 122500000 },
  ],
  attendance: [
    { className: "Toán 10A", attendanceRate: 92.5 },
    { className: "Toán 11B", attendanceRate: 88.3 },
    { className: "Lý 10C", attendanceRate: 85.7 },
    { className: "Hóa 11A", attendanceRate: 90.2 },
    { className: "Anh 12B", attendanceRate: 87.9 },
    { className: "Văn 10D", attendanceRate: 83.4 },
    { className: "Toán 12A", attendanceRate: 91.8 },
    { className: "Lý 11D", attendanceRate: 86.5 },
  ],
  distribution: [
    { className: "Toán 10", studentCount: 45, percentage: 18.4 },
    { className: "Toán 11", studentCount: 38, percentage: 15.5 },
    { className: "Toán 12", studentCount: 42, percentage: 17.1 },
    { className: "Lý 10", studentCount: 35, percentage: 14.3 },
    { className: "Lý 11", studentCount: 30, percentage: 12.2 },
    { className: "Hóa 11", studentCount: 25, percentage: 10.2 },
    { className: "Anh 12", studentCount: 20, percentage: 8.2 },
    { className: "Văn 10", studentCount: 10, percentage: 4.1 },
  ],
};

const statusConfig = {
  ready: { label: "Sẵn sàng", color: "bg-success/10 text-success", icon: CheckCircle2 },
  processing: { label: "Đang tạo", color: "bg-secondary/30 text-secondary-foreground", icon: Clock },
  scheduled: { label: "Đã lên lịch", color: "bg-primary/10 text-primary", icon: Calendar },
  failed: { label: "Lỗi", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

const reportTypes = ["Tất cả", "Doanh thu", "Điểm danh", "Chất lượng", "Học phí", "Tuyển sinh"];

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--info))",
  "hsl(var(--accent))",
  "#8b5cf6",
  "#ec4899",
];

export function AdminReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Tất cả");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredReports = reports.filter((report) => {
    const matchSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === "Tất cả" || report.type === filterType;
    const matchStatus = filterStatus === "all" || report.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const getStatusBadge = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status];
    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "hsl(var(--success))";
    if (rate >= 80) return "hsl(var(--primary))";
    if (rate >= 70) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Báo cáo & Phân tích</h1>
        <p className="text-muted-foreground">
          Tổng quan hoạt động, báo cáo và phân tích dữ liệu trung tâm
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Tổng học viên",
                value: analyticsData.overview.totalStudents.toString(),
                icon: Users,
                trend: analyticsData.overview.trends.students,
                color: "text-primary",
              },
              {
                title: "Doanh thu tháng",
                value: formatCurrency(analyticsData.overview.totalRevenue),
                icon: DollarSign,
                trend: analyticsData.overview.trends.revenue,
                color: "text-success",
              },
              {
                title: "Tỷ lệ điểm danh",
                value: `${analyticsData.overview.attendanceRate.toFixed(1)}%`,
                icon: TrendingUp,
                trend: analyticsData.overview.trends.attendance,
                color: "text-info",
              },
              {
                title: "Lớp đang hoạt động",
                value: analyticsData.overview.activeClasses.toString(),
                icon: BookOpen,
                trend: analyticsData.overview.trends.classes,
                color: "text-warning",
              },
            ].map((card) => (
              <Card key={card.title} className="glass-card hover:shadow-card-hover transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{card.value}</div>
                  <p
                    className={`text-xs flex items-center gap-1 ${
                      card.trend >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    <span>{card.trend >= 0 ? "↑" : "↓"}</span>
                    <span>{Math.abs(card.trend).toFixed(1)}% so với tháng trước</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo tháng</CardTitle>
                <p className="text-sm text-muted-foreground">12 tháng gần nhất</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="month"
                      className="text-xs"
                      tickFormatter={(value) => {
                        const [, month] = value.split("-");
                        return `T${month}`;
                      }}
                    />
                    <YAxis
                      className="text-xs"
                      tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Attendance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tỷ lệ điểm danh theo lớp</CardTitle>
                <p className="text-sm text-muted-foreground">Xanh: ≥90%, Vàng: 80-89%, Đỏ: &lt;80%</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.attendance}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="className" className="text-xs" angle={-45} textAnchor="end" height={80} />
                    <YAxis className="text-xs" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`, "Tỷ lệ"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="attendanceRate" radius={[8, 8, 0, 0]}>
                      {analyticsData.attendance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getAttendanceColor(entry.attendanceRate)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Student Distribution Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Phân bố học viên theo lớp</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tổng: {analyticsData.distribution.reduce((sum, item) => sum + item.studentCount, 0)} học viên
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ className, percentage }) => `${className}: ${percentage.toFixed(1)}%`}
                      outerRadius={100}
                      dataKey="studentCount"
                    >
                      {analyticsData.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        `${value} học viên (${props.payload.percentage.toFixed(1)}%)`,
                        props.payload.className,
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => `${entry.payload.className} (${entry.payload.studentCount})`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(statusConfig).map(([key, config]) => (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <config.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {reports.filter((r) => r.status === key).length}
                      </p>
                      <p className="text-sm text-muted-foreground">{config.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
              <CardTitle className="text-lg font-display">Danh sách báo cáo</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Tạo báo cáo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tạo báo cáo mới</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Loại báo cáo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTypes.filter((t) => t !== "Tất cả").map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Khoảng thời gian</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn khoảng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Tuần này</SelectItem>
                          <SelectItem value="month">Tháng này</SelectItem>
                          <SelectItem value="quarter">Quý này</SelectItem>
                          <SelectItem value="year">Năm nay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Định dạng</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn định dạng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="xlsx">XLSX</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="include-detail" />
                      <Label htmlFor="include-detail">Bao gồm dữ liệu chi tiết</Label>
                    </div>
                    <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                      Tạo báo cáo
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo mã hoặc tên báo cáo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <FileBarChart2 className="w-4 h-4 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="ready">Sẵn sàng</SelectItem>
                      <SelectItem value="processing">Đang tạo</SelectItem>
                      <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                      <SelectItem value="failed">Lỗi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Báo cáo</TableHead>
                    <TableHead className="hidden md:table-cell">Loại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="hidden lg:table-cell">Người tạo</TableHead>
                    <TableHead className="hidden sm:table-cell">Định dạng</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{report.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {report.id} • {report.period}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="text-xs">
                          {report.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status as keyof typeof statusConfig)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm text-muted-foreground">{report.createdBy}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {report.format}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" disabled={report.status !== "ready"}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
