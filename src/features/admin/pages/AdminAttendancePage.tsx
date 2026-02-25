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
  PlayCircle,
  Eye,
  Radio,
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
];

// Buổi học đang diễn ra (Live sessions)
const liveSessions = [
  {
    id: 101,
    class: "Văn 12 - Luyện Thi",
    time: "19:00 - 21:00",
    room: "Phòng 102",
    teacher: "Phạm Minh Tuấn",
    total: 20,
    checkedIn: 18,
    qrActive: true,
  },
  {
    id: 102,
    class: "Tiếng Anh B1",
    time: "19:30 - 21:00",
    room: "Phòng LAB 1",
    teacher: "Trần Văn Hùng",
    total: 15,
    checkedIn: 5,
    qrActive: false,
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Điểm danh</h2>
          <p className="text-sm text-muted-foreground">Quản lý và theo dõi chuyên cần của học viên</p>
        </div>
        <Button className="btn-primary">
          <QrCode className="w-4 h-4 mr-2" />
          Quản lý mã QR
        </Button>
      </div>

      {/* ── Stats ── */}
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
                <p className="text-sm text-muted-foreground">Tỉ lệ điểm danh TB</p>
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
                <p className="text-sm text-muted-foreground">Học viên đi muộn</p>
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
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ── Live Sessions ── */}
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-3 bg-primary/5 border-b border-primary/10 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display flex items-center gap-2 text-primary">
                  <Radio className="w-4 h-4 animate-pulse" />
                  Lớp học đang diễn ra
                </CardTitle>
                <Badge variant="outline" className="bg-background">
                  {liveSessions.length} lớp
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 grid sm:grid-cols-2 gap-4">
              {liveSessions.map((session) => (
                <div key={session.id} className="p-4 rounded-lg bg-card border border-border space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{session.class}</p>
                      <p className="text-xs text-muted-foreground">{session.room} • {session.time}</p>
                    </div>
                    {session.qrActive ? (
                      <Badge className="bg-green-500/10 text-green-600 border-0 flex items-center gap-1">
                        <QrCode className="w-3 h-3" /> Đã QR mở
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="border-0">Chưa mở QR</Badge>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Đã điểm danh</span>
                      <span className="font-medium">{session.checkedIn}/{session.total}</span>
                    </div>
                    <Progress value={(session.checkedIn / session.total) * 100} className="h-1.5" />
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-border/50">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">
                      <Eye className="w-3.5 h-3.5 mr-1.5" /> Theo dõi
                    </Button>
                    <Button variant={session.qrActive ? "secondary" : "default"} size="sm" className="w-full text-xs h-8">
                      {session.qrActive ? "Tắt mã QR" : "Bật mã QR"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Attendance History ── */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
              <CardTitle className="text-lg font-display">Lịch sử điểm danh</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Xuất báo cáo
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
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
                    <TableHead>Lớp học</TableHead>
                    <TableHead className="hidden sm:table-cell">Thời gian</TableHead>
                    <TableHead className="text-center">Sĩ số</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Vắng/Muộn</TableHead>
                    <TableHead>Tỉ lệ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium leading-snug">{item.class}</p>
                          <p className="text-xs text-muted-foreground">{item.teacher}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-col gap-0.5 text-muted-foreground text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {item.date}
                          </span>
                          <span className="text-xs">{item.time}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-primary/10 text-primary border-0">
                          {item.present}/{item.total}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        <div className="flex justify-center gap-1">
                          {item.absent > 0 && (
                            <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/5">
                              {item.absent} vắng
                            </Badge>
                          )}
                          {item.late > 0 && (
                            <Badge variant="outline" className="text-secondary-foreground border-secondary/30 bg-secondary/10">
                              {item.late} muộn
                            </Badge>
                          )}
                          {item.absent === 0 && item.late === 0 && (
                            <span className="text-muted-foreground text-xs">Đủ</span>
                          )}
                        </div>
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
        </div>

        {/* ── Right sidebar: Alerts ── */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Cảnh báo vắng liên tiếp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {absentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 space-y-2 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
                  <div className="flex items-center justify-between pl-2">
                    <p className="font-medium text-foreground text-sm">{alert.student}</p>
                    <Badge className="bg-destructive text-destructive-foreground border-0">
                      {alert.absences} buổi
                    </Badge>
                  </div>
                  <div className="pl-2 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Lớp <span className="font-medium text-foreground">{alert.class}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Học lần cuối: {alert.lastAttended}
                    </p>
                  </div>
                  <div className="flex gap-2 pl-2 pt-2 top-border border-destructive/10">
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-7 text-destructive hover:bg-destructive hover:text-white border-destructive/20">
                      Liên hệ PH
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-xs h-7">
                      Chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
