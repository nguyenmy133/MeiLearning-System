import { useState } from "react";
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  RefreshCw,
  MessageSquare,
  Users,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";

// ── Mock data: Consistent with TeacherReschedulePage ────────────────────
// These are the reschedule/cancel requests from ALL teachers

interface RescheduleRequest {
  id: string;
  teacherId: number;
  teacherName: string;
  teacherAvatar: string;
  type: "reschedule" | "cancel";
  className: string;
  originalDate: string;
  originalTime: string;
  requestedDate: string;
  requestedTime: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  rejectReason?: string;
}

const initialRequests: RescheduleRequest[] = [
  {
    id: "RS-202401-001",
    teacherId: 1,
    teacherName: "Nguyễn Văn An",
    teacherAvatar: "",
    type: "reschedule",
    className: "Toán 10A",
    originalDate: "18/01/2024",
    originalTime: "14:00 - 16:00",
    requestedDate: "19/01/2024",
    requestedTime: "14:00 - 16:00",
    reason: "Có cuộc họp với phụ huynh không thể dời được.",
    status: "pending",
    createdAt: "15/01/2024",
  },
  {
    id: "RS-202401-002",
    teacherId: 2,
    teacherName: "Trần Thị Mai",
    teacherAvatar: "",
    type: "cancel",
    className: "Anh Văn B1",
    originalDate: "20/01/2024",
    originalTime: "19:00 - 21:00",
    requestedDate: "",
    requestedTime: "",
    reason: "Bị ốm sốt, cần nghỉ ngơi 1 ngày.",
    status: "pending",
    createdAt: "18/01/2024",
  },
  {
    id: "RS-202401-003",
    teacherId: 1,
    teacherName: "Nguyễn Văn An",
    teacherAvatar: "",
    type: "reschedule",
    className: "Toán 12B",
    originalDate: "22/01/2024",
    originalTime: "16:30 - 18:30",
    requestedDate: "23/01/2024",
    requestedTime: "16:30 - 18:30",
    reason: "Xin đổi lịch do trùng lịch bồi dưỡng chuyên môn tại Sở GD.",
    status: "pending",
    createdAt: "19/01/2024",
  },
  {
    id: "RS-202401-004",
    teacherId: 3,
    teacherName: "Lê Thị Hương",
    teacherAvatar: "",
    type: "cancel",
    className: "Hóa 11",
    originalDate: "15/01/2024",
    originalTime: "08:00 - 10:00",
    requestedDate: "",
    requestedTime: "",
    reason: "Gia đình có việc đột xuất.",
    status: "approved",
    createdAt: "13/01/2024",
    reviewedAt: "13/01/2024",
  },
  {
    id: "RS-202401-005",
    teacherId: 2,
    teacherName: "Trần Thị Mai",
    teacherAvatar: "",
    type: "reschedule",
    className: "Anh Văn B2",
    originalDate: "12/01/2024",
    originalTime: "19:00 - 21:00",
    requestedDate: "14/01/2024",
    requestedTime: "19:00 - 21:00",
    reason: "Đổi sang Chủ nhật để cho học viên ôn bài.",
    status: "approved",
    createdAt: "10/01/2024",
    reviewedAt: "10/01/2024",
  },
  {
    id: "RS-202401-006",
    teacherId: 1,
    teacherName: "Nguyễn Văn An",
    teacherAvatar: "",
    type: "reschedule",
    className: "Toán 11A",
    originalDate: "10/01/2024",
    originalTime: "14:00 - 16:00",
    requestedDate: "11/01/2024",
    requestedTime: "16:00 - 18:00",
    reason: "Xin đổi để phù hợp với lịch cá nhân.",
    status: "rejected",
    createdAt: "08/01/2024",
    reviewedAt: "08/01/2024",
    rejectReason: "Phòng học không khả dụng vào thời gian yêu cầu.",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────

const getStatusConfig = (status: string) => {
  switch (status) {
    case "approved":
      return { text: "Đã duyệt", variant: "default" as const, color: "text-emerald-600" };
    case "rejected":
      return { text: "Từ chối", variant: "destructive" as const, color: "text-destructive" };
    default:
      return { text: "Chờ duyệt", variant: "secondary" as const, color: "text-amber-600" };
  }
};

const getTypeConfig = (type: string) => {
  return type === "reschedule"
    ? { label: "Đổi lịch", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" }
    : { label: "Hủy buổi", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" };
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase();

// ── Component ───────────────────────────────────────────────────────────

export function AdminRescheduleApprovalPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [filterTeacher, setFilterTeacher] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  // Unique teachers
  const teachers = Array.from(
    new Map(requests.map((r) => [r.teacherId, { id: r.teacherId, name: r.teacherName }])).values()
  );

  // Filter
  const getFilteredRequests = (tabStatus: string) => {
    return requests.filter((req) => {
      const matchStatus = tabStatus === "all" || req.status === tabStatus;
      const matchTeacher = filterTeacher === "all" || req.teacherId.toString() === filterTeacher;
      const matchType = filterType === "all" || req.type === filterType;
      const matchSearch =
        searchTerm === "" ||
        req.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchTeacher && matchType && matchSearch;
    });
  };

  // Actions
  const handleApprove = (request: RescheduleRequest) => {
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;
    setRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: "approved" as const, reviewedAt: dateStr } : r))
    );
    toast.success("Đã duyệt yêu cầu", {
      description: `Yêu cầu ${request.type === "reschedule" ? "đổi lịch" : "hủy buổi"} của ${request.teacherName} đã được duyệt.`,
    });
    setShowDetailDialog(false);
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectReason.trim()) return;
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest.id
          ? { ...r, status: "rejected" as const, reviewedAt: dateStr, rejectReason: rejectReason.trim() }
          : r
      )
    );
    toast.error("Đã từ chối yêu cầu", {
      description: `Yêu cầu của ${selectedRequest.teacherName} đã bị từ chối.`,
    });
    setShowRejectDialog(false);
    setShowDetailDialog(false);
    setRejectReason("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Duyệt yêu cầu đổi lịch
          </h1>
          <p className="text-muted-foreground mt-1">
            Xem và duyệt các yêu cầu đổi lịch / hủy buổi dạy từ giáo viên
          </p>
        </div>
        {stats.pending > 0 && (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 text-sm px-3 py-1.5 self-start">
            <Clock className="w-4 h-4 mr-1.5" />
            {stats.pending} yêu cầu chờ duyệt
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Tổng yêu cầu</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200/50 dark:border-amber-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
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
                <CheckCircle className="h-5 w-5 text-emerald-600" />
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
                placeholder="Tìm theo tên GV, lớp, mã yêu cầu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
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
            <Select value={filterType} onValueChange={setFilterType}>
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Chờ duyệt</span>
            {stats.pending > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs ml-1">{stats.pending}</Badge>
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

        {["pending", "approved", "rejected", "all"].map((tabVal) => {
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
                    {filtered.length === 0 ? "Không có yêu cầu nào." : `Hiển thị ${filtered.length} yêu cầu`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Không có yêu cầu nào trong mục này</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[180px]">Giáo viên</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Lớp</TableHead>
                            <TableHead className="hidden md:table-cell">Lịch gốc</TableHead>
                            <TableHead className="hidden lg:table-cell">Lịch mới</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map((req) => {
                            const typeCfg = getTypeConfig(req.type);
                            const statusCfg = getStatusConfig(req.status);
                            return (
                              <TableRow
                                key={req.id}
                                className={req.status === "pending" ? "bg-amber-50/30 dark:bg-amber-950/10" : ""}
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
                                      <p className="font-medium text-sm">{req.teacherName}</p>
                                      <p className="text-xs text-muted-foreground">{req.id}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`text-xs ${typeCfg.color}`}>
                                    {typeCfg.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm font-medium">{req.className}</span>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <div className="text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {req.originalDate}
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
                                        {req.requestedDate}
                                      </div>
                                      <div className="flex items-center gap-1 text-xs">
                                        <Clock className="w-3 h-3" />
                                        {req.requestedTime}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground italic">— Hủy buổi —</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={statusCfg.variant} className="text-xs">
                                    {statusCfg.text}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2.5"
                                      onClick={() => { setSelectedRequest(req); setShowDetailDialog(true); }}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      <span className="hidden sm:inline">Chi tiết</span>
                                    </Button>
                                    {req.status === "pending" && (
                                      <>
                                        <Button
                                          size="sm"
                                          className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                          onClick={() => handleApprove(req)}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          <span className="hidden sm:inline">Duyệt</span>
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 px-2.5 text-destructive hover:bg-destructive hover:text-white border-destructive/30"
                                          onClick={() => { setSelectedRequest(req); setRejectReason(""); setShowRejectDialog(true); }}
                                        >
                                          <XCircle className="w-4 h-4 mr-1" />
                                          <span className="hidden sm:inline">Từ chối</span>
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
                <Badge variant={getStatusConfig(selectedRequest.status).variant} className="text-xs">
                  {getStatusConfig(selectedRequest.status).text}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Loại yêu cầu</span>
                  <div>
                    <Badge variant="outline" className={getTypeConfig(selectedRequest.type).color}>
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
                    <p className="text-xs text-muted-foreground mb-1">Lịch gốc</p>
                    <p className="font-medium">{selectedRequest.originalDate}</p>
                    <p className="text-xs text-muted-foreground">{selectedRequest.originalTime}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {selectedRequest.type === "reschedule" ? "Lịch mới" : "Hủy buổi"}
                    </p>
                    {selectedRequest.type === "reschedule" ? (
                      <>
                        <p className="font-medium text-primary">{selectedRequest.requestedDate}</p>
                        <p className="text-xs text-primary">{selectedRequest.requestedTime}</p>
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
                <p className="text-xs text-muted-foreground text-right">Đã xử lý ngày {selectedRequest.reviewedAt}</p>
              )}

              {selectedRequest.status === "pending" && (
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive hover:text-white border-destructive/30"
                    onClick={() => { setShowDetailDialog(false); setSelectedRequest(selectedRequest); setRejectReason(""); setShowRejectDialog(true); }}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Từ chối
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleApprove(selectedRequest)}
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
            <DialogDescription>Vui lòng nhập lý do từ chối để giáo viên biết.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-3 bg-accent/50 rounded-lg text-sm">
                <p>
                  <span className="font-medium">{selectedRequest.teacherName}</span>
                  {" — "}
                  <span className="text-muted-foreground">
                    {getTypeConfig(selectedRequest.type).label} lớp {selectedRequest.className}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <Label>Lý do từ chối <span className="text-destructive">*</span></Label>
                <Textarea
                  placeholder="VD: Phòng học không khả dụng, trùng lịch lớp khác..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Hủy</Button>
                <Button variant="destructive" disabled={!rejectReason.trim()} onClick={handleReject}>
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
