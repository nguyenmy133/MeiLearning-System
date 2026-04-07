import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Eye,
  Calendar,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import {
  useRequests,
  useRescheduleStats,
  useApproveRequest,
  useRejectRequest,
} from "../hooks";
import type { RescheduleRequest, RequestStatus } from "../types";
import { formatDate, formatDateTime } from "@/lib/dateUtils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusConfig(status: RequestStatus) {
  switch (status) {
    case "pending":
      return {
        text: "Chờ duyệt",
        variant: "secondary" as const,
        color: "text-amber-600",
      };
    case "approved":
      return {
        text: "Đã duyệt",
        variant: "default" as const,
        color: "text-emerald-600",
      };
    case "rejected":
      return {
        text: "Từ chối",
        variant: "destructive" as const,
        color: "text-destructive",
      };
  }
}

function getTypeConfig(type: "reschedule" | "cancel") {
  if (type === "reschedule")
    return {
      label: "Đổi lịch",
      color: "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30",
    };
  return {
    label: "Hủy buổi",
    color:
      "text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950/30",
  };
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts
    .slice(-2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-72" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-12" />
      <Skeleton className="h-64" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminRescheduleApprovalPage() {
  const { data: requests, isLoading } = useRequests();
  const { data: stats } = useRescheduleStats();
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();

  const [filterTeacher, setFilterTeacher] = useState("all");
  const [filterType, setFilterType] = useState<
    "all" | "reschedule" | "cancel"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("pending");
  const [selectedRequest, setSelectedRequest] =
    useState<RescheduleRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const teachers = useMemo(() => {
    if (!requests) return [];
    const map = new Map<number, string>();
    requests.forEach((r) => map.set(r.teacherId, r.teacherName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [requests]);

  function getFilteredRequests(tabStatus: string) {
    if (!requests) return [];
    return requests.filter((r) => {
      if (tabStatus !== "all" && r.status !== tabStatus) return false;
      if (
        filterTeacher !== "all" &&
        r.teacherId.toString() !== filterTeacher
      )
        return false;
      if (filterType !== "all" && r.type !== filterType) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        if (
          !r.teacherName.toLowerCase().includes(q) &&
          !r.className.toLowerCase().includes(q) &&
          !r.id.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }

  function handleApprove(req: RescheduleRequest) {
    approveRequest.mutate(req.id, {
      onSuccess: () => setShowDetailDialog(false),
    });
  }

  function handleReject() {
    if (!selectedRequest) return;
    rejectRequest.mutate(
      { id: selectedRequest.id, reason: rejectReason },
      {
        onSuccess: () => {
          setShowRejectDialog(false);
          setRejectReason("");
        },
      }
    );
  }

  if (isLoading) return <PageSkeleton />;

  const statsData = stats ?? { total: 0, pending: 0, approved: 0, rejected: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Duyệt yêu cầu đổi / hủy buổi
            {statsData.pending > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {statsData.pending}
              </Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Xem xét và phê duyệt các yêu cầu từ giáo viên
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng yêu cầu",
            value: statsData.total,
            color: "text-foreground",
          },
          {
            label: "Chờ duyệt",
            value: statsData.pending,
            color: "text-amber-600",
          },
          {
            label: "Đã duyệt",
            value: statsData.approved,
            color: "text-emerald-600",
          },
          {
            label: "Từ chối",
            value: statsData.rejected,
            color: "text-destructive",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Tìm theo giáo viên, lớp, mã yêu cầu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-3"
              />
            </div>
            <Select value={filterTeacher} onValueChange={setFilterTeacher}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-1" />
                <SelectValue placeholder="Tất cả GV" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả giáo viên</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterType}
              onValueChange={(v) =>
                setFilterType(v as "all" | "reschedule" | "cancel")
              }
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Tất cả loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="reschedule">Đổi lịch</SelectItem>
                <SelectItem value="cancel">Hủy buổi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs + Table */}
      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          setActiveTab(v as "pending" | "approved" | "rejected" | "all")
        }
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Chờ duyệt</span>
            {statsData.pending > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs ml-1">
                {statsData.pending}
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
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Tất cả</span>
          </TabsTrigger>
        </TabsList>

        {(["pending", "approved", "rejected", "all"] as const).map(
          (tabVal) => {
            const filtered = getFilteredRequests(tabVal);
            return (
              <TabsContent key={tabVal} value={tabVal} className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display">
                      {tabVal === "pending" && "Yêu cầu chờ duyệt"}
                      {tabVal === "approved" && "Yêu cầu đã duyệt"}
                      {tabVal === "rejected" && "Yêu cầu đã từ chối"}
                      {tabVal === "all" && "Tất cả yêu cầu"}
                    </CardTitle>
                    <CardDescription>
                      {filtered.length === 0
                        ? "Không có yêu cầu nào."
                        : `Hiển thị ${filtered.length} yêu cầu`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filtered.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">
                          Không có yêu cầu nào trong mục này
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-[180px]">
                                Giáo viên
                              </TableHead>
                              <TableHead>Loại</TableHead>
                              <TableHead>Lớp</TableHead>
                              <TableHead className="hidden md:table-cell">
                                Lịch gốc
                              </TableHead>
                              <TableHead className="hidden lg:table-cell">
                                Lịch mới
                              </TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead className="text-right">
                                Thao tác
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filtered.map((req) => {
                              const typeCfg = getTypeConfig(req.type);
                              const statusCfg = getStatusConfig(req.status);
                              return (
                                <TableRow
                                  key={req.id}
                                  className={
                                    req.status === "pending"
                                      ? "bg-amber-50/30 dark:bg-amber-950/10"
                                      : ""
                                  }
                                >
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-9 w-9">
                                        <AvatarImage src={req.teacherAvatar} />
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                          {getInitials(req.teacherName)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium text-sm">
                                          {req.teacherName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {req.id}
                                        </p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${typeCfg.color}`}
                                    >
                                      {typeCfg.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm font-medium">
                                      {req.className}
                                    </span>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <div className="text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(req.originalDate)}
                                      </div>
                                      <div className="flex items-center gap-1 text-xs">
                                        <Clock className="w-3 h-3" />
                                        {req.originalTime}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell">
                                    {req.type === "reschedule" ? (
                                      <div className="text-sm text-primary">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-3.5 h-3.5" />
                                          {formatDate(req.requestedDate)}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs">
                                          <Clock className="w-3 h-3" />
                                          {req.requestedTime}
                                          {req.requestedEndTime && ` - ${req.requestedEndTime}`}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground italic">
                                        — Hủy buổi —
                                      </span>
                                    )}
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
                                        onClick={() => {
                                          setSelectedRequest(req);
                                          setShowDetailDialog(true);
                                        }}
                                      >
                                        <Eye className="w-4 h-4 mr-1" />
                                        <span className="hidden sm:inline">
                                          Chi tiết
                                        </span>
                                      </Button>
                                      {req.status === "pending" && (
                                        <>
                                          <Button
                                            size="sm"
                                            className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                            onClick={() => handleApprove(req)}
                                            disabled={
                                              approveRequest.isPending
                                            }
                                          >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            <span className="hidden sm:inline">
                                              Duyệt
                                            </span>
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-2.5 text-destructive hover:bg-destructive hover:text-white border-destructive/30"
                                            onClick={() => {
                                              setSelectedRequest(req);
                                              setRejectReason("");
                                              setShowRejectDialog(true);
                                            }}
                                            disabled={
                                              rejectRequest.isPending
                                            }
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
          }
        )}
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              Chi tiết yêu cầu {selectedRequest?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={selectedRequest.teacherAvatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(selectedRequest.teacherName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{selectedRequest.teacherName}</p>
                  <p className="text-sm text-muted-foreground">Giáo viên</p>
                </div>
                <Badge
                  variant={getStatusConfig(selectedRequest.status).variant}
                  className="text-xs"
                >
                  {getStatusConfig(selectedRequest.status).text}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Loại yêu cầu</span>
                  <div>
                    <Badge
                      variant="outline"
                      className={getTypeConfig(selectedRequest.type).color}
                    >
                      {getTypeConfig(selectedRequest.type).label}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Lớp học</span>
                  <p className="font-medium">{selectedRequest.className}</p>
                </div>
              </div>

              {/* Schedule change visual */}
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Lịch gốc
                    </p>
                    <p className="font-medium">{formatDate(selectedRequest.originalDate)}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedRequest.originalTime}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {selectedRequest.type === "reschedule"
                        ? "Lịch mới"
                        : "Hủy buổi"}
                    </p>
                    {selectedRequest.type === "reschedule" ? (
                      <>
                        <p className="font-medium text-primary">
                          {formatDate(selectedRequest.requestedDate)}
                        </p>
                        <p className="text-xs text-primary">
                          {selectedRequest.requestedTime}
                          {selectedRequest.requestedEndTime && ` - ${selectedRequest.requestedEndTime}`}
                        </p>
                      </>
                    ) : (
                      <p className="text-destructive font-medium">Không dạy</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground">Lý do</Label>
                <div className="p-3 bg-secondary/50 rounded-lg text-sm">
                  <MessageSquare className="w-4 h-4 text-muted-foreground inline-block mr-1.5" />
                  {selectedRequest.reason}
                </div>
              </div>

              {selectedRequest.rejectReason && (
                <div className="space-y-1.5">
                  <Label className="text-destructive">Lý do từ chối</Label>
                  <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-sm text-destructive">
                    {selectedRequest.rejectReason}
                  </div>
                </div>
              )}

              {selectedRequest.reviewedAt && (
                <p className="text-xs text-muted-foreground text-right">
                  Đã xử lý ngày {formatDateTime(selectedRequest.reviewedAt)}
                </p>
              )}

              {selectedRequest.status === "pending" && (
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive hover:text-white border-destructive/30"
                    onClick={() => {
                      setShowDetailDialog(false);
                      setRejectReason("");
                      setShowRejectDialog(true);
                    }}
                    disabled={rejectRequest.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Từ chối
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleApprove(selectedRequest)}
                    disabled={approveRequest.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Duyệt
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" /> Từ chối yêu cầu
            </DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối để giáo viên biết.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-3 bg-accent/50 rounded-lg text-sm">
                <p>
                  <span className="font-medium">
                    {selectedRequest.teacherName}
                  </span>
                  {" — "}
                  <span className="text-muted-foreground">
                    {getTypeConfig(selectedRequest.type).label} lớp{" "}
                    {selectedRequest.className}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <Label>
                  Lý do từ chối <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  placeholder="VD: Phòng học không khả dụng, trùng lịch lớp khác..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(false)}
                  disabled={rejectRequest.isPending}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  disabled={!rejectReason.trim() || rejectRequest.isPending}
                  onClick={handleReject}
                >
                  <XCircle className="w-4 h-4 mr-2" /> Xác nhận từ chối
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
