import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  MapPin,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useClasses } from "@/features/admin/classes/hooks";
import { useRescheduleRequests, useCreateReschedule } from "../hooks";
import { authService } from "@/features/shared/auth/authService";

const TEACHER_ID = authService.getCurrentTeacherId();

const dummy = `// Removed static mock data`;

export function TeacherReschedulePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState<"reschedule" | "makeup">("reschedule");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [originalDate, setOriginalDate] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");

  const { data: classPage } = useClasses({ teacherId: TEACHER_ID, limit: 50 });
  const myClasses = classPage?.data ?? [];

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
    if (!selectedClassId || !originalDate || !reason) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    
    if (requestType === "reschedule" && (!newDate || !newTime)) {
      toast.error("Vui lòng chọn ngày và giờ mới!");
      return;
    }

    createReschedule.mutate(
      {
        classId: Number(selectedClassId),
        type: requestType,
        originalDate,
        originalTime: "14:00 - 16:00", // Would be selected dynamically based on class schedule in a full app
        requestedDate: requestType === "reschedule" ? newDate : undefined,
        requestedTime: requestType === "reschedule" ? newTime : undefined,
        reason,
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setSelectedClassId("");
          setOriginalDate("");
          setNewDate("");
          setNewTime("");
          setReason("");
        },
      }
    );
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
                <Select value={requestType} onValueChange={(v: "reschedule" | "makeup") => setRequestType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reschedule">Đổi lịch dạy</SelectItem>
                    <SelectItem value="makeup">Dạy bù</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lớp học</label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
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
                <label className="text-sm font-medium">Ngày gốc cần đổi/hủy</label>
                <Input
                  type="date"
                  value={originalDate}
                  onChange={(e) => setOriginalDate(e.target.value)}
                />
              </div>

              {requestType === "reschedule" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ngày mới</label>
                    <Input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Giờ mới</label>
                    <Select value={newTime} onValueChange={setNewTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giờ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00 - 10:00">08:00 - 10:00</SelectItem>
                        <SelectItem value="10:00 - 12:00">10:00 - 12:00</SelectItem>
                        <SelectItem value="14:00 - 16:00">14:00 - 16:00</SelectItem>
                        <SelectItem value="16:00 - 18:00">16:00 - 18:00</SelectItem>
                        <SelectItem value="18:00 - 20:00">18:00 - 20:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
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
                        {request.type === "reschedule" ? "Đổi lịch" : "Dạy bù"}
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
