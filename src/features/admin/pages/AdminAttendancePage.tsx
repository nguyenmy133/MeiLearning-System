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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  QrCode,
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
  Clock,
  Download,
  Calendar,
  AlertTriangle,
} from "lucide-react";

// Mock attendance data
const attendanceData = [
  {
    id: 1,
    class: "Toán 10A",
    date: "16/12/2024",
    time: "18:00 - 20:00",
    total: 18,
    present: 16,
    absent: 1,
    late: 1,
    rate: 89,
    teacher: "Nguyễn Thị Mai",
  },
  {
    id: 2,
    class: "Anh Văn B1",
    date: "17/12/2024",
    time: "19:00 - 21:00",
    total: 15,
    present: 14,
    absent: 1,
    late: 0,
    rate: 93,
    teacher: "Trần Văn Hùng",
  },
  {
    id: 3,
    class: "Hóa 11",
    date: "21/12/2024",
    time: "08:00 - 10:00",
    total: 12,
    present: 10,
    absent: 2,
    late: 0,
    rate: 83,
    teacher: "Lê Thị Hương",
  },
  {
    id: 4,
    class: "Văn 12",
    date: "16/12/2024",
    time: "08:00 - 10:00",
    total: 22,
    present: 20,
    absent: 1,
    late: 1,
    rate: 91,
    teacher: "Phạm Minh Tuấn",
  },
  {
    id: 5,
    class: "Toán 10A",
    date: "18/12/2024",
    time: "18:00 - 20:00",
    total: 18,
    present: 17,
    absent: 0,
    late: 1,
    rate: 94,
    teacher: "Nguyễn Thị Mai",
  },
];

const absentAlerts = [
  { id: 1, student: "Phạm Thị Dung", class: "Văn 12", absences: 3, lastAttended: "10/12/2024" },
  { id: 2, student: "Nguyễn Văn An", class: "Toán 10A", absences: 3, lastAttended: "11/12/2024" },
  { id: 3, student: "Trần Minh Khoa", class: "Hóa 11", absences: 4, lastAttended: "08/12/2024" },
];

const classList = ["Tất cả lớp", "Toán 10A", "Anh Văn B1", "Hóa 11", "Văn 12"];

export function AdminAttendancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("Tất cả lớp");
  const [filterDate, setFilterDate] = useState("");

  const overallRate = Math.round(
    attendanceData.reduce((acc, d) => acc + d.rate, 0) / attendanceData.length
  );

  const filteredData = attendanceData.filter((item) => {
    const matchSearch =
      item.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = filterClass === "Tất cả lớp" || item.class === filterClass;
    return matchSearch && matchClass;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {attendanceData.reduce((acc, d) => acc + d.total, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Tổng học viên</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{overallRate}%</p>
                <p className="text-sm text-muted-foreground">Tỉ lệ điểm danh</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {attendanceData.reduce((acc, d) => acc + d.late, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Đi muộn tuần này</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <UserX className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{absentAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Cảnh báo vắng</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
            <CardTitle className="text-lg font-display">Lịch sử điểm danh</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Xuất báo cáo
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo lớp, giáo viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classList.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-40"
              />
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lớp</TableHead>
                  <TableHead className="hidden sm:table-cell">Ngày</TableHead>
                  <TableHead className="text-center">Có mặt</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Vắng</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Muộn</TableHead>
                  <TableHead>Tỉ lệ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.class}</p>
                        <p className="text-xs text-muted-foreground">{item.teacher}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-primary/10 text-primary border-0">
                        {item.present}/{item.total}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      {item.absent > 0 ? (
                        <Badge className="bg-destructive/10 text-destructive border-0">
                          {item.absent}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      {item.late > 0 ? (
                        <Badge className="bg-secondary/30 text-secondary-foreground border-0">
                          {item.late}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={item.rate} className="w-16 h-2" />
                        <span className="text-sm font-medium">{item.rate}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Absent Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-secondary" />
              Cảnh báo vắng liên tiếp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {absentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{alert.student}</p>
                  <Badge className="bg-destructive/10 text-destructive border-0">
                    {alert.absences} buổi
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.class}</p>
                <p className="text-xs text-muted-foreground">
                  Lần cuối: {alert.lastAttended}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    Liên hệ PH
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
