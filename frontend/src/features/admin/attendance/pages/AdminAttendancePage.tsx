import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
  Eye,
  Radio,
  Loader2,
} from "lucide-react";
import {
  useAttendanceSessions,
  useAttendanceStats,
  useLiveSessions,
  useAbsentAlerts,
  useToggleQR,
} from "../hooks";
import type { AttendanceQueryParams } from "../types";
import { ATTENDANCE_CLASS_LIST } from "../types";
import { toast } from "sonner";

// ── Format helpers ────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  // "YYYY-MM-DD" → "DD/MM/YYYY"
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ── Table skeleton ────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-28 mb-1" />
            <Skeleton className="h-3 w-20" />
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </TableCell>
          <TableCell className="text-center"><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
          <TableCell className="text-center hidden md:table-cell"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function AdminAttendancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClassId, setFilterClassId] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const queryParams: AttendanceQueryParams = {
    search: searchTerm || undefined,
    classId: filterClassId !== "all" ? filterClassId : undefined,
    date: filterDate || undefined,
  };

  const { data: sessions = [], isLoading: loadingSessions } = useAttendanceSessions(queryParams);
  const { data: stats, isLoading: loadingStats } = useAttendanceStats();
  const { data: liveSessions = [], isLoading: loadingLive } = useLiveSessions();
  const { data: absentAlerts = [], isLoading: loadingAlerts } = useAbsentAlerts();
  const toggleQRMutation = useToggleQR();

  const statCards = [
    {
      label: "Tổng học viên",
      value: stats?.totalStudents,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Tỉ lệ điểm danh TB",
      value: stats ? `${stats.averageRate}%` : undefined,
      icon: UserCheck,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Học viên đi muộn",
      value: stats?.totalLate,
      icon: Clock,
      color: "text-secondary-foreground",
      bg: "bg-secondary/20",
    },
    {
      label: "Cảnh báo vắng",
      value: stats?.alertCount,
      icon: UserX,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Điểm danh</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý và theo dõi chuyên cần của học viên
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}
                >
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  {loadingStats ? (
                    <Skeleton className="h-7 w-12 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live sessions */}
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-3 bg-primary/5 border-b border-primary/10 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display flex items-center gap-2 text-primary">
                  <Radio className="w-4 h-4 animate-pulse" />
                  Lớp học đang diễn ra
                </CardTitle>
                <Badge variant="outline" className="bg-background">
                  {loadingLive ? "..." : `${liveSessions.length} lớp`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 grid sm:grid-cols-2 gap-4">
              {loadingLive
                ? [1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-lg" />)
                : liveSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 rounded-lg bg-card border border-border space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {session.className}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.room} • {session.startTime} - {session.endTime}
                          </p>
                        </div>
                        {session.qrActive ? (
                          <Badge className="bg-green-500/10 text-green-600 border-0 flex items-center gap-1">
                            <QrCode className="w-3 h-3" />
                            QR mở
                            {session.activeBy === "admin" && (
                              <span className="text-green-700/70 font-normal">(Admin)</span>
                            )}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="border-0">
                            Chưa mở QR
                          </Badge>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Đã điểm danh</span>
                          <span className="font-medium">
                            {session.checkedIn}/{session.total}
                          </span>
                        </div>
                        <Progress
                          value={(session.checkedIn / session.total) * 100}
                          className="h-1.5"
                        />
                      </div>

                      <div className="flex gap-2 pt-1 border-t border-border/50">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-8"
                          onClick={() => toast.info("Tính năng theo dõi real-time")}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Theo dõi
                        </Button>
                        <Button
                          variant={session.qrActive ? "secondary" : "default"}
                          size="sm"
                          className="w-full text-xs h-8"
                          disabled={toggleQRMutation.isPending}
                          onClick={() => toggleQRMutation.mutate({ sessionId: session.id, activatedBy: "admin" })}
                        >
                          {toggleQRMutation.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : session.qrActive ? (
                            "Tắt mã QR"
                          ) : (
                            "Bật mã QR"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
            </CardContent>
          </Card>

          {/* Attendance history */}
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
                <Select value={filterClassId} onValueChange={setFilterClassId}>
                  <SelectTrigger className="w-36">
                    <Filter className="w-4 h-4 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả lớp</SelectItem>
                    {ATTENDANCE_CLASS_LIST.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
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
                    <TableHead className="text-center hidden md:table-cell">
                      Vắng / Muộn
                    </TableHead>
                    <TableHead>Tỉ lệ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingSessions ? (
                    <TableSkeleton />
                  ) : sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <p className="text-muted-foreground">
                          Không có dữ liệu điểm danh
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium leading-snug">{item.className}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.teacherName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex flex-col gap-0.5 text-muted-foreground text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.date)}
                            </span>
                            <span className="text-xs">
                              {item.startTime} - {item.endTime}
                            </span>
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
                              <Badge
                                variant="outline"
                                className="text-destructive border-destructive/30 bg-destructive/5"
                              >
                                {item.absent} vắng
                              </Badge>
                            )}
                            {item.late > 0 && (
                              <Badge
                                variant="outline"
                                className="text-amber-600 dark:text-amber-500 border-amber-500/30 bg-amber-500/10"
                              >
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
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar: absence alerts */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Cảnh báo vắng liên tiếp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingAlerts
                ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)
                : absentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 space-y-2 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
                      <div className="flex items-center justify-between pl-2">
                        <p className="font-medium text-foreground text-sm">
                          {alert.studentName}
                        </p>
                        <Badge className="bg-destructive text-destructive-foreground border-0">
                          {alert.absences} buổi
                        </Badge>
                      </div>
                      <div className="pl-2 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Lớp{" "}
                          <span className="font-medium text-foreground">
                            {alert.className}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Học lần cuối: {alert.lastAttended}
                        </p>
                      </div>
                      <div className="flex gap-2 pl-2 pt-2 border-t border-destructive/10">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-7 text-destructive hover:bg-destructive hover:text-white border-destructive/20"
                          onClick={() =>
                            toast.info(`Liên hệ phụ huynh học viên ${alert.studentName}`)
                          }
                        >
                          Liên hệ PH
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-xs h-7"
                          onClick={() =>
                            toast.info(`Xem chi tiết học viên ${alert.studentName}`)
                          }
                        >
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
