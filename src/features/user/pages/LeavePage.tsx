import { useState } from "react";
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
import { toast } from "sonner";

// ── Mock data: Consistent with TeacherLeaveApprovalPage ─────────────────
// This user = "Nguyễn Minh Anh" in classes: Toán 10A
// Their leave requests as seen from the student's perspective

interface LeaveRequest {
  id: string;
  type: "leave" | "late";
  date: string;
  className: string;
  sessionTime: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedBy?: string;     // Tên GV duyệt
  reviewedAt?: string;     // Ngày duyệt
  rejectReason?: string;   // Lý do từ chối
}

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: "LR-202412-001",
    type: "leave",
    date: "20/12/2024",
    className: "Toán 10A",
    sessionTime: "18:00 - 20:00",
    reason: "Có việc gia đình đột xuất, xin phép nghỉ 1 buổi.",
    status: "pending",
    createdAt: "18/12/2024",
  },
  {
    id: "LR-202412-009",
    type: "late",
    date: "16/12/2024",
    className: "Toán 10A",
    sessionTime: "18:00 - 20:00",
    reason: "Em bị kẹt xe trên đường đi học, dự kiến đến muộn 15 phút.",
    status: "approved",
    createdAt: "15/12/2024",
    reviewedBy: "Nguyễn Văn Toán",
    reviewedAt: "15/12/2024",
  },
  {
    id: "LR-202412-010",
    type: "leave",
    date: "10/12/2024",
    className: "Toán 10A",
    sessionTime: "18:00 - 20:00",
    reason: "Đi khám bệnh theo lịch hẹn bệnh viện.",
    status: "approved",
    createdAt: "08/12/2024",
    reviewedBy: "Nguyễn Văn Toán",
    reviewedAt: "08/12/2024",
  },
  {
    id: "LR-202412-011",
    type: "leave",
    date: "05/12/2024",
    className: "Toán 10A",
    sessionTime: "18:00 - 20:00",
    reason: "Tham dự đám cưới anh/chị.",
    status: "rejected",
    createdAt: "03/12/2024",
    reviewedBy: "Nguyễn Văn Toán",
    reviewedAt: "03/12/2024",
    rejectReason: "Đã quá hạn gửi đơn (cần gửi trước 24 giờ).",
  },
];

// Upcoming classes for creating new requests
const upcomingClasses = [
  {
    id: 1,
    name: "Toán 10A",
    date: "22/12/2024",
    time: "18:00 - 20:00",
    teacher: "Nguyễn Văn Toán",
  },
  {
    id: 2,
    name: "Toán 10A",
    date: "24/12/2024",
    time: "18:00 - 20:00",
    teacher: "Nguyễn Văn Toán",
  },
  {
    id: 3,
    name: "Toán 10A",
    date: "26/12/2024",
    time: "18:00 - 20:00",
    teacher: "Nguyễn Văn Toán",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    case "rejected":
      return <XCircle className="h-5 w-5 text-destructive" />;
    case "pending":
      return <Clock className="h-5 w-5 text-amber-500" />;
    default:
      return null;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "approved":
      return "Đã duyệt";
    case "rejected":
      return "Từ chối";
    case "pending":
      return "Chờ duyệt";
    default:
      return "";
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "approved":
      return "default";
    case "rejected":
      return "destructive";
    case "pending":
      return "secondary";
    default:
      return "outline";
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

// ── Component ───────────────────────────────────────────────────────────

export function LeavePage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [isOpen, setIsOpen] = useState(false);
  const [requestType, setRequestType] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestType || !selectedClass || !reason.trim()) return;

    const selectedSession = upcomingClasses.find(
      (c) => c.id.toString() === selectedClass
    );
    if (!selectedSession) return;

    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;

    const newRequest: LeaveRequest = {
      id: `LR-202412-${(leaveRequests.length + 10).toString().padStart(3, "0")}`,
      type: requestType as "leave" | "late",
      date: selectedSession.date,
      className: selectedSession.name,
      sessionTime: selectedSession.time,
      reason: reason.trim(),
      status: "pending",
      createdAt: dateStr,
    };

    setLeaveRequests([newRequest, ...leaveRequests]);
    toast.success("Đã gửi yêu cầu", {
      description: `Yêu cầu ${requestType === "leave" ? "xin nghỉ" : "đi muộn"} của bạn đã được gửi đến ${selectedSession.teacher} và đang chờ duyệt.`,
    });
    setIsOpen(false);
    setRequestType("");
    setSelectedClass("");
    setReason("");
  };

  // Stats
  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((r) => r.status === "pending").length,
    approved: leaveRequests.filter((r) => r.status === "approved").length,
    rejected: leaveRequests.filter((r) => r.status === "rejected").length,
  };

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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo yêu cầu mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Loại yêu cầu</Label>
                <Select value={requestType} onValueChange={setRequestType}>
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
                <Label>Buổi học</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn buổi học" />
                  </SelectTrigger>
                  <SelectContent>
                    {upcomingClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name} - {cls.date} ({cls.time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              {/* Info about who will review */}
              {selectedClass && (
                <div className="flex items-center gap-2 p-2.5 bg-primary/5 rounded-lg text-sm text-muted-foreground">
                  <User className="w-4 h-4 text-primary" />
                  <span>
                    Đơn sẽ gửi đến:{" "}
                    <span className="font-medium text-foreground">
                      {upcomingClasses.find((c) => c.id.toString() === selectedClass)?.teacher}
                    </span>
                  </span>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={!requestType || !selectedClass || !reason.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Gửi yêu cầu
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
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

      {/* Request List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
          <CardDescription>
            Các yêu cầu xin nghỉ và đi muộn của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaveRequests.map((request) => (
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
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(request.status)}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getTypeColor(request.type)}`}
                        >
                          {getTypeLabel(request.type)}
                        </Badge>
                        <Badge
                          variant={getStatusBadgeVariant(request.status) as any}
                          className="text-xs"
                        >
                          {getStatusText(request.status)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {request.id}
                        </span>
                      </div>
                      <p className="font-medium text-foreground">
                        {request.className}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {request.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {request.sessionTime}
                        </span>
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
                          <span className="font-medium text-foreground">
                            {request.reviewedBy}
                          </span>
                          {request.reviewedAt && (
                            <span> — {request.reviewedAt}</span>
                          )}
                        </p>
                      )}

                      {/* Reject reason */}
                      {request.rejectReason && (
                        <div className="mt-2 p-2.5 bg-destructive/5 border border-destructive/20 rounded-md">
                          <p className="text-sm text-destructive">
                            <span className="font-medium">Lý do từ chối:</span>{" "}
                            {request.rejectReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {request.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
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
                <li>Yêu cầu xin nghỉ cần được gửi trước ít nhất 24 giờ</li>
                <li>Mỗi học viên được phép nghỉ tối đa 3 buổi/khóa học</li>
                <li>
                  Đơn sẽ được gửi trực tiếp đến giáo viên phụ trách lớp để
                  duyệt
                </li>
                <li>
                  Buổi học bù sẽ được sắp xếp sau khi yêu cầu được duyệt
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
