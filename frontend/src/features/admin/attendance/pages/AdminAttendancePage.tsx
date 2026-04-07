import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
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
  Activity,
} from "lucide-react";
import {
  useAttendanceSessions,
  useAttendanceStats,
  useLiveSessions,
  useAbsentAlerts,
  useToggleQR,
  useSessionRecords,
} from "../hooks";
import type { AttendanceQueryParams } from "../types";
import { useClassOptions } from "@/hooks/useClassOptions";
import { formatDate } from "@/lib/dateUtils";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Format helpers ────────────────────────────────────────────────────────────
// formatDate imported from @/lib/dateUtils

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
// ── Helpers ────────────────────────────────────────────────────────────────────
const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** Issue #5: Kiểm tra session đã đến giờ chưa (cho phép trước 5 phút) */
const isSessionStarted = (startTime: string) => {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= toMinutes(startTime) - 5;
};

export function AdminAttendancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClassId, setFilterClassId] = useState("all");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const { data: classOptions } = useClassOptions();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterClassId, filterDate]);

  const queryParams: AttendanceQueryParams & { page?: number; limit?: number } = {
    search: searchTerm || undefined,
    classId: filterClassId !== "all" ? filterClassId : undefined,
    date: filterDate ? format(filterDate, "yyyy-MM-dd") : undefined,
    page,
    limit,
  };

  const { data: sessionsResponse, isLoading: loadingSessions } = useAttendanceSessions(queryParams);
  const sessionsData = (sessionsResponse as any) ?? { data: [], total: 0, totalPages: 1 };
  const sessions = Array.isArray(sessionsResponse) ? sessionsResponse : (sessionsData.data ?? []);
  const total = sessionsData.total ?? 0;
  const totalPages = sessionsData.totalPages ?? 1;
  const { data: stats, isLoading: loadingStats } = useAttendanceStats();
  const { data: liveSessions = [], isLoading: loadingLive } = useLiveSessions();
  const { data: absentAlerts = [], isLoading: loadingAlerts } = useAbsentAlerts();
  const toggleQRMutation = useToggleQR();

  // ── QR Modal state ──────────────────────────────────────────────────────────
  const [qrModal, setQrModal] = useState<{
    open: boolean;
    sessionId: number;
    className: string;
    token: string;
    expiresAt: string;
  }>({ open: false, sessionId: 0, className: "", token: "", expiresAt: "" });
  const [qrCountdown, setQrCountdown] = useState(0);

  // ── Roster detail dialog state (Issue #4) ───────────────────────────────────
  const [rosterModal, setRosterModal] = useState<{ open: boolean; sessionId: number; className: string; date: string; time: string }>({
    open: false, sessionId: 0, className: "", date: "", time: "",
  });
  const { data: rosterData = [], isLoading: rosterLoading } = useSessionRecords(rosterModal.sessionId);

  // Countdown timer for QR modal
  useEffect(() => {
    if (!qrModal.open || qrCountdown <= 0) return;
    const timer = setInterval(() => setQrCountdown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [qrModal.open, qrCountdown]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  // Calculate remaining seconds for a live session's QR
  const getRemaining = useCallback((expiresAt: string) => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  }, []);

  const statCards = [
    {
      label: "Có mặt hôm nay",
      value: stats?.todayPresent,
      icon: UserCheck,
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
                        {session.qrActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs h-8 border-green-300 text-green-600 hover:bg-green-50"
                            onClick={() => {
                              setQrModal({
                                open: true,
                                sessionId: session.id,
                                className: session.className,
                                token: session.qrToken,
                                expiresAt: session.qrExpiresAt,
                              });
                              setQrCountdown(getRemaining(session.qrExpiresAt));
                            }}
                          >
                            <QrCode className="w-3.5 h-3.5 mr-1.5" />
                            Xem QR ({formatTime(getRemaining(session.qrExpiresAt))})
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full text-xs h-8"
                            disabled={toggleQRMutation.isPending || !isSessionStarted(session.startTime)}
                            title={!isSessionStarted(session.startTime) ? "Chưa đến giờ học (có thể bật trước 5 phút)" : undefined}
                            onClick={() => {
                              toggleQRMutation.mutate(
                                { sessionId: session.id, activatedBy: "admin" },
                                {
                                  onSuccess: (data: any) => {
                                    if (data?.token) {
                                      setQrModal({
                                        open: true,
                                        sessionId: session.id,
                                        className: session.className,
                                        token: data.token,
                                        expiresAt: data.expiresAt,
                                      });
                                      setQrCountdown(Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
                                    }
                                  },
                                }
                              );
                            }}
                          >
                            {toggleQRMutation.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : !isSessionStarted(session.startTime) ? (
                              <>Chưa đến giờ</>
                            ) : (
                              <>Bật mã QR</>
                            )}
                          </Button>
                        )}
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
                    {(classOptions ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DatePicker
                  value={filterDate}
                  onChange={setFilterDate}
                  placeholder="Lọc theo ngày"
                  className="w-44"
                />
              </div>

              {/* Table */}
              {/* Issue #4: Compact table — gộp Sĩ số + Vắng/Muộn, thêm Xem chi tiết */}
              <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lớp học</TableHead>
                    <TableHead className="hidden sm:table-cell">Thời gian</TableHead>
                    <TableHead className="text-center">Sĩ số / Vắng</TableHead>
                    <TableHead>Tỉ lệ</TableHead>
                    <TableHead className="text-center w-24"></TableHead>
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
                          <div className="flex flex-col items-center gap-0.5">
                            <Badge className="bg-primary/10 text-primary border-0">
                              {item.present}/{item.total}
                            </Badge>
                            <div className="flex gap-1">
                              {item.absent > 0 && (
                                <span className="text-[10px] text-destructive">{item.absent} vắng</span>
                              )}
                              {item.late > 0 && (
                                <span className="text-[10px] text-amber-600">{item.late} muộn</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={item.rate} className="w-16 h-2" />
                            <span className="text-sm font-medium">{item.rate}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {/* Chỉ hiển thị "Chi tiết" khi session đã hoàn thành */}
                          {item.status === "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => setRosterModal({
                                open: true,
                                sessionId: item.id,
                                className: item.className,
                                date: item.date,
                                time: `${item.startTime} - ${item.endTime}`,
                              })}
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> Chi tiết
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {/* Pagination Component */}
              <div className="mt-4 border-t pt-2">
                <DataTablePagination
                  page={page}
                  limit={limit}
                  total={total}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                />
              </div>
              </>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar: Live Activity Feed */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2 border-b border-border/50 mb-3">
              <CardTitle className="text-base font-display flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Log điểm danh bất thường
                </div>
                <div className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4">
              {loadingAlerts
                ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)
                : absentAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Không có log điểm danh bất thường nào hôm nay</p>
                ) : absentAlerts.map((log: any, index: number) => {
                    const isAbsent = log.status === "absent" || log.status === "absent_excused";
                    const colorClass = isAbsent ? "text-destructive" : "text-amber-500";
                    const bgClass = isAbsent ? "bg-destructive/10" : "bg-amber-500/10";
                    const dotClass = isAbsent ? "bg-destructive" : "bg-amber-500";
                    const label = log.status === "late" ? "Đến muộn" : (log.status === "absent_excused" ? "Nghỉ có phép" : "Vắng mặt");
                    
                    // Format timestamp
                    let timeString = "";
                    try {
                      timeString = format(new Date(log.timestamp), "dd/MM/yyyy HH:mm");
                    } catch {
                      timeString = "N/A";
                    }

                    return (
                      <div key={log.id} className="relative pl-4">
                        <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ${dotClass}`} />
                        {index !== absentAlerts.length - 1 && (
                          <div className="absolute left-[3px] top-3.5 w-px h-[calc(100%+8px)] bg-border -z-10" />
                        )}
                        
                        <div className="flex flex-col gap-1 pb-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">{timeString}</span>
                            <Badge variant="outline" className={`${colorClass} ${bgClass} border-0 text-[10px] px-1.5 py-0`}>{label}</Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground">{log.studentName}</p>
                          <p className="text-xs text-muted-foreground">Lớp: {log.className}</p>
                        </div>
                      </div>
                    )
                  })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={qrModal.open} onOpenChange={(open) => setQrModal((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Mã QR — {qrModal.className}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCountdown > 0 ? (
              <>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <QRCodeSVG
                    value={`${window.location.origin}/user/qr-check-in?token=${qrModal.token}`}
                    size={220}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div
                  className={`flex items-center gap-2 text-2xl font-bold font-mono ${
                    qrCountdown < 60 ? "text-red-500 animate-pulse" : "text-primary"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  {formatTime(qrCountdown)}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Học viên quét mã này để điểm danh
                </p>
              </>
            ) : (
              <div className="text-center space-y-3 py-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                  <QrCode className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-sm text-muted-foreground">Mã QR đã hết hạn</p>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full"
              disabled={toggleQRMutation.isPending}
              onClick={() => {
                toggleQRMutation.mutate(
                  { sessionId: qrModal.sessionId, activatedBy: "admin" },
                  {
                    onSuccess: (data: any) => {
                      if (data?.token) {
                        setQrModal((prev) => ({ ...prev, token: data.token, expiresAt: data.expiresAt }));
                        setQrCountdown(Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
                      }
                    },
                  }
                );
              }}
            >
              {toggleQRMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <QrCode className="w-4 h-4 mr-2" />
              )}
              Tạo mã QR mới
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Roster Detail Dialog (Issue #4) */}
      <Dialog open={rosterModal.open} onOpenChange={(open) => setRosterModal((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Chi tiết điểm danh — {rosterModal.className}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {rosterModal.date && formatDate(rosterModal.date)} · {rosterModal.time}
            </p>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {rosterLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)
            ) : rosterData.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">Chưa có dữ liệu điểm danh cho buổi học này.</p>
            ) : (
              rosterData.map((r: any) => (
                <div key={r.id ?? r.studentId} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {(r.studentName ?? "").charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.studentName}</p>
                      {r.checkInTime && (
                        <p className="text-[11px] text-muted-foreground">
                          Check-in: {r.checkInTime} · {r.method === "qr" ? "QR" : "Thủ công"}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      r.status === "present" ? "bg-green-100 text-green-700 border-green-200" :
                      r.status === "late" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                      r.status === "absent_excused" ? "bg-blue-100 text-blue-700 border-blue-200" :
                      r.status === "absent" ? "bg-red-100 text-red-700 border-red-200" :
                      "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {r.status === "present" ? "Có mặt" :
                     r.status === "late" ? "Đi muộn" :
                     r.status === "absent_excused" ? "Nghỉ CP" :
                     r.status === "absent" ? "Vắng" : "Chưa ĐD"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
