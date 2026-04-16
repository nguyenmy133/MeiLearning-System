import { useState } from "react";
import { formatDateTime } from "@/lib/dateUtils";
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLeaveRequests, useLeaveStats, useApproveLeave, useRejectLeave } from "../hooks";
import type { StudentLeaveRequest } from "../types";
import { useClasses } from "@/features/admin/classes/hooks";

// ── Helpers ──────────────────────────────────────────────────────────────

const getStatusConfig = (status: string) => {
  switch (status) {
    case "approved":
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        text: "Đã duyệt",
        variant: "default" as const,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        border: "border-emerald-200 dark:border-emerald-800",
      };
    case "rejected":
      return {
        icon: <XCircle className="h-4 w-4" />,
        text: "Từ chối",
        variant: "destructive" as const,
        color: "text-destructive",
        bg: "bg-destructive/5",
        border: "border-destructive/20",
      };
    case "pending":
    default:
      return {
        icon: <Clock className="h-4 w-4" />,
        text: "Chờ duyệt",
        variant: "secondary" as const,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/30",
        border: "border-amber-200 dark:border-amber-800",
      };
  }
};

const getTypeLabel = (type: string) => {
  return type === "leave" ? "Xin nghỉ" : "Đi muộn";
};

const getTypeColor = (type: string) => {
  return type === "leave"
    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(-2)
    .join("")
    .toUpperCase();
};

// ── Component ───────────────────────────────────────────────────────────

export function TeacherLeaveApprovalPage() {
  const [filterClass, setFilterClass] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState<StudentLeaveRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // ── Service layer hooks ──────────────────────────────────────────────────
  const { data: classPage } = useClasses({ limit: 50 });
  const classes = classPage?.data ?? [];
  const myClasses = classes;

  const { data: leaveRequests = [], isLoading } = useLeaveRequests({
    classId: filterClass !== "all" ? filterClass : undefined,
    search: searchTerm || undefined,
  });
  const { data: statsData } = useLeaveStats();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  const stats = statsData ?? { total: 0, pending: 0, approved: 0, rejected: 0 };

  // Filters by tab
  const getFilteredRequests = (tabStatus: string) =>
    leaveRequests.filter((r) => tabStatus === "all" || r.status === tabStatus);

  // ── Actions ──
  const handleApprove = (request: StudentLeaveRequest) => {
    approveLeave.mutate(request.id, {
      onSuccess: () => {
        setShowDetailDialog(false);
      },
    });
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectReason.trim()) return;
    rejectLeave.mutate(
      { id: selectedRequest.id, dto: { rejectReason: rejectReason.trim() } },
      {
        onSuccess: () => {
          setShowRejectDialog(false);
          setShowDetailDialog(false);
          setRejectReason("");
        },
      }
    );
  };

  const openDetail = (request: StudentLeaveRequest) => {
    setSelectedRequest(request);
    setShowDetailDialog(true);
  };

  const openRejectDialog = (request: StudentLeaveRequest) => {
    setSelectedRequest(request);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Duyệt đơn xin nghỉ
          </h1>
          <p className="text-muted-foreground mt-1">
            Xem và duyệt các đơn xin nghỉ / đi muộn từ học viên trong lớp của bạn
          </p>
        </div>
        {stats.pending > 0 && (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700 text-sm px-3 py-1.5 self-start">
            <Clock className="w-4 h-4 mr-1.5" />
            {stats.pending} đơn chờ duyệt
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Tổng đơn</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200/50 dark:border-amber-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Từ chối</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên học viên, mã đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-1" />
                <SelectValue placeholder="Tất cả lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lớp</SelectItem>
                {myClasses.map((cls) => (
                  <SelectItem key={cls.id} value={String(cls.id)}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs + Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Chờ duyệt</span>
            {stats.pending > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs ml-1">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1.5">
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Đã duyệt</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1.5">
            <XCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Từ chối</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Tất cả</span>
          </TabsTrigger>
        </TabsList>

        {["pending", "approved", "rejected", "all"].map((tabVal) => {
          const filtered = getFilteredRequests(tabVal);
          return (
            <TabsContent key={tabVal} value={tabVal} className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-display">
                    {tabVal === "pending" && "Đơn chờ duyệt"}
                    {tabVal === "approved" && "Đơn đã duyệt"}
                    {tabVal === "rejected" && "Đơn đã từ chối"}
                    {tabVal === "all" && "Tất cả đơn"}
                  </CardTitle>
                  <CardDescription>
                    {filtered.length === 0
                      ? "Không có đơn nào."
                      : `Hiển thị ${filtered.length} đơn`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Không có đơn nào trong mục này</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px]">Học viên</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Lớp</TableHead>
                            <TableHead className="hidden md:table-cell">
                              Ngày nghỉ
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                              Ngày gửi
                            </TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map((request) => {
                            const statusCfg = getStatusConfig(request.status);
                            return (
                              <TableRow
                                key={request.id}
                                className={
                                  request.status === "pending"
                                    ? "bg-amber-50/30 dark:bg-amber-950/10"
                                    : ""
                                }
                              >
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                        {getInitials(request.requesterName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-sm text-foreground">
                                        {request.requesterName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {request.id}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getTypeColor(request.type)}`}
                                  >
                                    {getTypeLabel(request.type)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm">{request.className}</span>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {request.sessionDate?.split("-").reverse().join("/") ?? "—"}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                  <span className="text-sm text-muted-foreground">
                                    {formatDateTime(request.createdAt)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={statusCfg.variant}
                                    className="text-xs"
                                  >
                                    {statusCfg.text}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2.5"
                                      onClick={() => openDetail(request)}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      <span className="hidden sm:inline">
                                        Chi tiết
                                      </span>
                                    </Button>
                                    {request.status === "pending" && (
                                      <>
                                        <Button
                                          size="sm"
                                          className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                          onClick={() => handleApprove(request)}
                                          disabled={approveLeave.isPending}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          <span className="hidden sm:inline">
                                            {approveLeave.isPending ? "Đang duyệt..." : "Duyệt"}
                                          </span>
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 px-2.5 text-destructive hover:bg-destructive hover:text-white border-destructive/30"
                                          onClick={() => openRejectDialog(request)}
                                        >
                                          <XCircle className="w-4 h-4 mr-1" />
                                          <span className="hidden sm:inline">
                                            Từ chối
                                          </span>
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* ▸ Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Chi tiết đơn {selectedRequest?.id}
            </DialogTitle>
            <DialogDescription>
              Xem thông tin đầy đủ và xử lý đơn xin nghỉ / đi muộn
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              {/* Student info */}
              <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(selectedRequest.requesterName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {selectedRequest.requesterName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.className}
                  </p>
                </div>
                <Badge
                  variant={getStatusConfig(selectedRequest.status).variant}
                  className="text-xs"
                >
                  {getStatusConfig(selectedRequest.status).text}
                </Badge>
              </div>

              {/* Request details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Loại đơn</span>
                  <div>
                    <Badge variant="outline" className={getTypeColor(selectedRequest.type)}>
                      {getTypeLabel(selectedRequest.type)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Ngày nghỉ/đi muộn</span>
                  <p className="font-medium">{selectedRequest.sessionDate?.split("-").reverse().join("/") ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Ca học</span>
                  <p className="font-medium">
                    {selectedRequest.startTime && selectedRequest.endTime
                      ? `${selectedRequest.startTime.slice(0, 5)} - ${selectedRequest.endTime.slice(0, 5)}`
                      : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Ngày gửi đơn</span>
                  <p className="font-medium">{selectedRequest.createdAt}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground">Lý do</Label>
                <div className="p-3 bg-secondary/50 rounded-lg text-sm">
                  <MessageSquare className="w-4 h-4 text-muted-foreground inline-block mr-1.5" />
                  {selectedRequest.reason}
                </div>
              </div>

              {/* Reject reason (if rejected) */}
              {selectedRequest.rejectReason && (
                <div className="space-y-1.5">
                  <Label className="text-destructive">Lý do từ chối</Label>
                  <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-sm text-destructive">
                    {selectedRequest.rejectReason}
                  </div>
                </div>
              )}

              {/* Review info */}
              {selectedRequest.reviewedAt && (
                <div className="text-xs text-muted-foreground text-right">
                  Đã xử lý ngày {selectedRequest.reviewedAt}
                </div>
              )}

              {/* Actions */}
              {selectedRequest.status === "pending" && (
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive hover:text-white border-destructive/30"
                    onClick={() => {
                      setShowDetailDialog(false);
                      openRejectDialog(selectedRequest);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Từ chối
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleApprove(selectedRequest)}
                    disabled={approveLeave.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {approveLeave.isPending ? "Đang duyệt..." : "Duyệt đơn"}
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ▸ Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Từ chối đơn xin nghỉ
            </DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối để học viên biết.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-3 bg-accent/50 rounded-lg text-sm">
                <p>
                  <span className="font-medium">{selectedRequest.requesterName}</span>
                  {" — "}
                  <span className="text-muted-foreground">
                    {getTypeLabel(selectedRequest.type)} ngày {selectedRequest.sessionDate?.split("-").reverse().join("/") ?? "—"}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reject-reason">
                  Lý do từ chối <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reject-reason"
                  placeholder="VD: Lý do không hợp lệ, đã quá hạn gửi đơn..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={rejectLeave.isPending}>
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  disabled={!rejectReason.trim() || rejectLeave.isPending}
                  onClick={handleReject}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {rejectLeave.isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Info notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Quy định duyệt đơn</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Đơn xin nghỉ / đi muộn hợp lệ khi gửi trước thời gian bắt đầu buổi học</li>
                <li>Mỗi học viên được phép có phép tối đa 3 buổi/khóa học</li>
                <li>Khi duyệt đơn, hệ thống sẽ tự động cập nhật trạng thái cho học viên</li>
                <li>Học viên nghỉ quá 3 buổi sẽ hiển thị cảnh báo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
