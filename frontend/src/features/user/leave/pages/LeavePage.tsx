import { useState, useMemo } from "react";
import { formatDateTime, getLocalDateISO } from "@/lib/dateUtils";
import {
  Clock,
  Calendar,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  ClipboardList,
  MessageSquare,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyLeaveRequests, useCreateLeaveRequest, useCancelLeaveRequest } from "@/features/user/leave/hooks";
import { useMyClasses, useClassSessions } from "@/features/user/schedule/hooks";
import type { CreateLeaveRequestDTO, LeaveRequestStatus, LeaveRequestType } from "@/features/user/leave/types";
import { toast } from "sonner";

// ── Date helpers ─────────────────────────────────────────────────────────

const WEEKDAY_LABELS = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

function getToday() {
  return getLocalDateISO();
}

function getDateAfter(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return getLocalDateISO(d);
}

function formatSessionDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const weekday = WEEKDAY_LABELS[d.getDay()];
  const dd = d.getDate().toString().padStart(2, "0");
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${weekday} - ${dd}/${mm}/${d.getFullYear()}`;
}

// ── Helpers ──────────────────────────────────────────────────────────────

const getStatusIcon = (status: LeaveRequestStatus) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    case "rejected":
      return <XCircle className="h-5 w-5 text-destructive" />;
    case "pending":
      return <Clock className="h-5 w-5 text-amber-500" />;
  }
};

const getStatusText = (status: LeaveRequestStatus) => {
  const map: Record<LeaveRequestStatus, string> = {
    approved: "Đã duyệt", rejected: "Từ chối", pending: "Chờ duyệt",
  };
  return map[status];
};

const getStatusBadgeVariant = (status: LeaveRequestStatus) => {
  const map: Record<LeaveRequestStatus, string> = {
    approved: "default", rejected: "destructive", pending: "secondary",
  };
  return map[status];
};

const getTypeLabel = (type: LeaveRequestType) =>
  type === "leave" ? "Xin nghỉ" : "Đi muộn";

const getTypeColor = (type: LeaveRequestType) =>
  type === "leave"
    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";

// ── Component ───────────────────────────────────────────────────────────

export function LeavePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [requestType, setRequestType] = useState<LeaveRequestType | "">("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [reason, setReason] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | LeaveRequestStatus>("all");

  // ── Service hooks ───────────────────────────────────────────────────
  const { data: leaveRequests = [], isLoading } = useMyLeaveRequests();
  const { data: classes = [] } = useMyClasses();
  const createMutation = useCreateLeaveRequest();
  const cancelMutation = useCancelLeaveRequest();

  // Only ACTIVE classes can receive leave requests
  const activeClasses = classes.filter((c) => c.status === "active");

  // Load sessions for selected class
  const { data: classSessions = [] } = useClassSessions(selectedClassId);

  // Filter: today → +14 days, only upcoming/ongoing sessions
  const today = getToday();
  const twoWeeksLater = getDateAfter(14);
  const upcomingSessions = useMemo(() => {
    return classSessions
      .filter(
        (s) =>
          s.date >= today &&
          s.date <= twoWeeksLater &&
          (s.status === "upcoming" || s.status === "ongoing")
      )
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [classSessions, today, twoWeeksLater]);

  const selectedSession = upcomingSessions.find((s) => s.id === selectedSessionId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestType || !selectedClassId || !reason.trim() || !selectedSession) return;

    const dto: CreateLeaveRequestDTO = {
      requesterType: "student",
      sessionId: Number(selectedSession.id),
      type: requestType as LeaveRequestType,
      reason: reason.trim(),
    };

    createMutation.mutate(dto, {
      onSuccess: () => {
        setIsOpen(false);
        setRequestType("");
        setSelectedClassId("");
        setSelectedSessionId("");
        setReason("");
        toast.success("Đã gửi yêu cầu", {
          description: `Yêu cầu ${requestType === "leave" ? "xin nghỉ" : "đi muộn"} của bạn đã được gửi và đang chờ duyệt.`,
        });
      },
    });
  };

  // Stats derived from service data
  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((r) => r.status === "pending").length,
    approved: leaveRequests.filter((r) => r.status === "approved").length,
    rejected: leaveRequests.filter((r) => r.status === "rejected").length,
  };

  const filteredRequests = filterStatus === "all"
    ? leaveRequests
    : leaveRequests.filter((r) => r.status === filterStatus);

  const selectedClass = activeClasses.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Xin nghỉ / Đi muộn
          </h1>
          <p className="text-muted-foreground mt-1">
            Gửi yêu cầu xin nghỉ học hoặc thông báo đi muộn đến giáo viên
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo yêu cầu mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo yêu cầu mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Loại yêu cầu</Label>
                <Select value={requestType} onValueChange={(v) => setRequestType(v as LeaveRequestType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại yêu cầu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leave">Xin nghỉ học</SelectItem>
                    <SelectItem value="late">Thông báo đi muộn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lớp học</Label>
                <Select
                  value={selectedClassId}
                  onValueChange={(v) => {
                    setSelectedClassId(v);
                    setSelectedSessionId(""); // Reset session khi đổi lớp
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp học" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} — {cls.sessionTime}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Buổi học</Label>
                <Select
                  value={selectedSessionId}
                  onValueChange={setSelectedSessionId}
                  disabled={!selectedClassId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedClassId
                          ? "Vui lòng chọn lớp học trước"
                          : upcomingSessions.length === 0
                          ? "Không có buổi học nào trong 2 tuần tới"
                          : "Chọn buổi học"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {upcomingSessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {formatSessionDate(session.date)} | {session.startTime} - {session.endTime} | {session.room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedClassId && upcomingSessions.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Không tìm thấy buổi học nào từ hôm nay đến 2 tuần tới cho lớp này.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Lý do</Label>
                <Textarea
                  placeholder="Nhập lý do chi tiết..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Info about who will review — always Teacher */}
              {selectedClass && (
                <div className="flex items-center gap-2 p-2.5 bg-primary/5 rounded-lg text-sm text-muted-foreground">
                  <User className="w-4 h-4 text-primary" />
                  <span>
                    Đơn sẽ gửi đến:{" "}
                    <span className="font-medium text-foreground">
                      {selectedClass.teacherName}
                    </span>{" "}
                    (Giáo viên phụ trách)
                  </span>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={!requestType || !selectedClassId || !reason.trim() || !selectedSessionId || createMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {createMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Tổng yêu cầu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.pending}</p>
                    <p className="text-xs text-muted-foreground">Chờ duyệt</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.approved}</p>
                    <p className="text-xs text-muted-foreground">Đã duyệt</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.rejected}</p>
                    <p className="text-xs text-muted-foreground">Từ chối</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Request List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
          <CardDescription>Các yêu cầu xin nghỉ và đi muộn của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto">
            {[
              { key: "all" as const, label: "Tất cả", count: stats.total },
              { key: "pending" as const, label: "Chờ duyệt", count: stats.pending },
              { key: "approved" as const, label: "Đã duyệt", count: stats.approved },
              { key: "rejected" as const, label: "Từ chối", count: stats.rejected },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={filterStatus === tab.key ? "default" : "outline"}
                size="sm"
                className="text-xs h-8"
                onClick={() => setFilterStatus(tab.key)}
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                    {tab.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Không có yêu cầu nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    request.status === "pending"
                      ? "bg-amber-50/30 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-800/30"
                      : request.status === "rejected"
                      ? "bg-destructive/5 border-destructive/20"
                      : "bg-secondary/50 border-border"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(request.status)}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-xs ${getTypeColor(request.type)}`}>
                            {getTypeLabel(request.type)}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(request.status) as any} className="text-xs">
                            {getStatusText(request.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">#{request.id}</span>
                        </div>
                        {request.className && (
                          <p className="font-medium text-foreground">{request.className}</p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {request.sessionDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {request.sessionDate.split("-").reverse().join("/")}
                            </span>
                          )}
                          {request.startTime && request.endTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {request.startTime.slice(0, 5)} - {request.endTime.slice(0, 5)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <MessageSquare className="w-3.5 h-3.5 inline-block mr-1" />
                          <span className="font-medium">Lý do:</span> {request.reason}
                        </p>

                        {/* Reviewer info */}
                        {request.reviewedBy && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {request.status === "approved" ? "Duyệt bởi" : "Từ chối bởi"}:{" "}
                            <span className="font-medium text-foreground">{request.reviewedBy}</span>
                            {request.reviewedAt && <span> — {formatDateTime(request.reviewedAt)}</span>}
                          </p>
                        )}

                        {request.rejectReason && (
                          <div className="mt-2 p-2.5 bg-destructive/5 border border-destructive/20 rounded-md">
                            <p className="text-sm text-destructive">
                              <span className="font-medium">Lý do từ chối:</span> {request.rejectReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(request.createdAt)}
                      </span>
                      {request.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive h-7 text-xs"
                          onClick={() => cancelMutation.mutate(request.id)}
                          disabled={cancelMutation.isPending}
                        >
                          Huỷ đơn
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Lưu ý khi xin nghỉ</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Yêu cầu xin nghỉ cần được gửi trước khi buổi học được bắt đầu</li>
            
                <li>
                  Đơn sẽ được gửi đến <span className="font-medium text-foreground">Giáo viên</span> phụ trách lớp để duyệt
                </li>
                <li>
                  Buổi nghỉ <span className="font-medium text-foreground">có phép được duyệt</span> sẽ{" "}
                  <span className="font-medium text-foreground">không tính vào học phí</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
