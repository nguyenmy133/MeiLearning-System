import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Clock,
  Calendar,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useClasses } from "@/features/admin/classes/hooks";
import { useRescheduleRequests, useCreateReschedule } from "../hooks";

// ── Fetch sessions cho 1 class ────────────────────────────────────────────────
interface SessionOption {
  id: number;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
  status: string;
}

function useClassSessions(classId: number | null) {
  return useQuery({
    queryKey: ["class-sessions", classId],
    queryFn: async (): Promise<SessionOption[]> => {
      if (!classId) return [];
      const { data } = await apiClient.get("/sessions", {
        params: { classId },
      });
      const list = Array.isArray(data) ? data : data?.data ?? [];
      return list;
    },
    enabled: !!classId,
  });
}

export function TeacherReschedulePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState<"reschedule" | "cancel">("reschedule");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [newDateTime, setNewDateTime] = useState<Date | undefined>(undefined);
  const [newEndTime, setNewEndTime] = useState("");
  const [reason, setReason] = useState("");

  // Backend tự filter lớp theo teacher từ JWT
  const { data: myClasses = [] } = useClasses({ limit: 50 });

  // Lấy danh sách buổi học khi chọn lớp
  const classIdNum = selectedClassId ? Number(selectedClassId) : null;
  const { data: allSessions = [] } = useClassSessions(classIdNum);

  // Chỉ hiện sessions upcoming
  const upcomingSessions = useMemo(
    () => allSessions.filter((s) => s.status === "upcoming"),
    [allSessions]
  );

  // Lấy session đã chọn
  const selectedSession = useMemo(
    () => upcomingSessions.find((s) => String(s.id) === selectedSessionId),
    [upcomingSessions, selectedSessionId]
  );

  const { data: requests = [] } = useRescheduleRequests();
  const createReschedule = useCreateReschedule();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400">Chờ duyệt</Badge>;
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">Đã duyệt</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Từ chối</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "approved":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    if (!selectedClassId || !selectedSessionId || !reason) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (requestType === "reschedule" && !newDateTime) {
      toast.error("Vui lòng chọn ngày và giờ mới!");
      return;
    }

    if (requestType === "reschedule" && !newEndTime) {
      toast.error("Vui lòng chọn giờ kết thúc mới!");
      return;
    }

    if (!selectedSession) {
      toast.error("Không tìm thấy buổi học đã chọn!");
      return;
    }

    createReschedule.mutate(
      {
        classId: Number(selectedClassId),
        sessionId: Number(selectedSessionId),
        type: requestType,
        originalDate: selectedSession.date,
        originalTime: `${selectedSession.startTime} - ${selectedSession.endTime}`,
        requestedDate: requestType === "reschedule" && newDateTime
          ? format(newDateTime, "yyyy-MM-dd")
          : undefined,
        requestedTime: requestType === "reschedule" && newDateTime
          ? format(newDateTime, "HH:mm")
          : undefined,
        requestedEndTime: requestType === "reschedule" ? newEndTime : undefined,
        reason,
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setSelectedClassId("");
          setSelectedSessionId("");
          setNewDateTime(undefined);
          setNewEndTime("");
          setReason("");
        },
      }
    );
  };

  // Reset session khi đổi class
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSessionId("");
  };

  const formatSessionLabel = (s: SessionOption) => {
    // "YYYY-MM-DD" → "DD/MM/YYYY"
    const parts = s.date.split("-");
    const dateStr = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : s.date;
    return `${dateStr} — ${s.startTime} ~ ${s.endTime}`;
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Yêu cầu đổi lịch</h1>
          <p className="text-muted-foreground">Quản lý các yêu cầu đổi lịch hoặc hủy buổi dạy</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo yêu cầu mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo yêu cầu mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Loại yêu cầu</label>
                <Select value={requestType} onValueChange={(v: "reschedule" | "cancel") => setRequestType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reschedule">Đổi lịch dạy</SelectItem>
                    <SelectItem value="cancel">Hủy buổi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lớp học</label>
                <Select value={selectedClassId} onValueChange={handleClassChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    {myClasses.map((cls) => (
                      <SelectItem key={cls.id} value={String(cls.id)}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Buổi học cần đổi/hủy</label>
                <Select
                  value={selectedSessionId}
                  onValueChange={setSelectedSessionId}
                  disabled={!selectedClassId || upcomingSessions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedClassId
                          ? "Chọn lớp trước"
                          : upcomingSessions.length === 0
                            ? "Không có buổi học nào sắp tới"
                            : "Chọn buổi học"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {upcomingSessions.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {formatSessionLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSession && (
                  <p className="text-xs text-muted-foreground">
                    Ngày: {selectedSession.date} • Giờ: {selectedSession.startTime} - {selectedSession.endTime}
                  </p>
                )}
              </div>

              {requestType === "reschedule" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Ngày &amp; giờ mới (bắt đầu - kết thúc)
                  </label>
                  <DateTimePicker
                    value={newDateTime}
                    onChange={setNewDateTime}
                    showEndTime
                    endTime={newEndTime}
                    onEndTimeChange={setNewEndTime}
                    placeholder="Chọn ngày, giờ bắt đầu & kết thúc"
                    fromDate={new Date()}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Lý do</label>
                <Textarea
                  placeholder="Nhập lý do yêu cầu..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={createReschedule.isPending}>
                <Send className="w-4 h-4 mr-2" />
                Gửi yêu cầu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span className="text-2xl font-bold text-amber-500">{pendingCount}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Chờ duyệt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-2xl font-bold text-emerald-500">{approvedCount}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Đã duyệt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{rejectedCount}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Từ chối</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
          <TabsTrigger value="rejected">Từ chối</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    {request.type === "reschedule" ? (
                      <RefreshCw className="w-5 h-5 text-primary" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground">{request.className}</h4>
                      <Badge variant="outline">
                        {request.type === "reschedule" ? "Đổi lịch" : "Hủy buổi"}
                      </Badge>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {request.originalDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {request.originalTime}
                        </span>
                      </div>
                      
                      {request.type === "reschedule" && (
                        <div className="flex items-center gap-2 text-primary">
                          <span>→</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {request.requestedDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {request.requestedTime}
                            {request.requestedEndTime && ` - ${request.requestedEndTime}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Lý do:</span> {request.reason}
                    </p>

                    {request.status === "approved" && (
                      <p className="mt-2 text-sm text-success">
                        ✓ Được duyệt bởi {request.approvedBy} vào {request.approvedAt}
                      </p>
                    )}

                    {request.status === "rejected" && request.rejectedReason && (
                      <p className="mt-2 text-sm text-destructive">
                        ✗ Lý do từ chối: {request.rejectedReason}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusIcon(request.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {requests.filter(r => r.status === "pending").map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-10 h-10 p-2 rounded-lg bg-amber-50 text-amber-500" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{request.className}</h4>
                    <p className="text-sm text-muted-foreground">{request.originalDate} • {request.originalTime}</p>
                    <p className="text-sm mt-1">{request.reason}</p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-4">
          {requests.filter(r => r.status === "approved").map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-10 h-10 p-2 rounded-lg bg-emerald-50 text-emerald-500" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{request.className}</h4>
                    <p className="text-sm text-muted-foreground">{request.originalDate} • {request.originalTime}</p>
                    <p className="text-sm mt-1">{request.reason}</p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-4">
          {requests.filter(r => r.status === "rejected").map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <XCircle className="w-10 h-10 p-2 rounded-lg bg-destructive/10 text-destructive" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{request.className}</h4>
                    <p className="text-sm text-muted-foreground">{request.originalDate} • {request.originalTime}</p>
                    <p className="text-sm mt-1">{request.reason}</p>
                    {request.rejectedReason && (
                      <p className="text-sm text-destructive mt-1">Từ chối: {request.rejectedReason}</p>
                    )}
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
