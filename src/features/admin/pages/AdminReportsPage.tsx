import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  FileBarChart2,
  Plus,
  Search,
  Calendar,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// Mock data
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

const statusConfig = {
  ready: { label: "Sẵn sàng", color: "bg-success/10 text-success", icon: CheckCircle2 },
  processing: { label: "Đang tạo", color: "bg-secondary/30 text-secondary-foreground", icon: Clock },
  scheduled: { label: "Đã lên lịch", color: "bg-primary/10 text-primary", icon: Calendar },
  failed: { label: "Lỗi", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

const reportTypes = ["Tất cả", "Doanh thu", "Điểm danh", "Chất lượng", "Học phí", "Tuyển sinh"];

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

  return (
    <div className="space-y-6">
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
    </div>
  );
}
