import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bell,
  CalendarClock,
  Check,
  Send,
  ShieldAlert,
  Trash2,
  Users,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "@/features/user/notifications/hooks/useNotifications";
import {
  notificationService,
  type SendNotificationPayload,
} from "@/features/user/notifications/services/notificationService";

type NotificationType = "system" | "teacher" | "student" | "schedule" | string;

const filters: Array<{
  key: "all" | "unread" | NotificationType;
  label: string;
}> = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "system", label: "Hệ thống" },
  { key: "teacher", label: "Giáo viên" },
  { key: "student", label: "Học viên" },
  { key: "schedule", label: "Lịch học" },
];

export function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useNotifications();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SendNotificationPayload>({
    title: "",
    content: "",
    severity: "LOW",
    role: null,
    userId: null,
  });

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  // ── Mutations ──────────────────────────────────────────────────

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (payload: SendNotificationPayload) =>
      notificationService.sendNotification(payload),
    onSuccess: () => {
      toast.success("Thông báo đã được gửi thành công!");
      setSendDialogOpen(false);
      setFormData({
        title: "",
        content: "",
        severity: "LOW",
        role: null,
        userId: null,
      });
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
    },
    onError: () => {
      toast.error("Gửi thông báo thất bại. Vui lòng thử lại.");
    },
  });

  // ── Handlers ───────────────────────────────────────────────────

  const handleSend = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }
    sendMutation.mutate(formData);
  };

  const filterNotifications = (filter: string) => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((item) => !item.read);
    // Map filter key to notification types
    const typeMap: Record<string, string[]> = {
      system: ["admin_broadcast", "system"],
      teacher: ["schedule_change", "leave_approved", "leave_rejected"],
      student: ["tuition", "exam", "exam_submission"],
      schedule: ["schedule_change"],
    };
    const types = typeMap[filter] || [filter];
    return notifications.filter((item) =>
      types.includes(item.type || "")
    );
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "admin_broadcast":
      case "system":
        return { label: "Hệ thống", className: "bg-primary/10 text-primary" };
      case "leave_approved":
      case "leave_rejected":
      case "schedule_change":
        return { label: "Lịch học", className: "bg-warning/10 text-warning" };
      case "tuition":
        return { label: "Học phí", className: "bg-info/10 text-info" };
      case "exam":
      case "exam_submission":
        return { label: "Bài thi", className: "bg-success/10 text-success" };
      default:
        return {
          label: "Thông báo",
          className: "bg-muted text-muted-foreground",
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "admin_broadcast":
      case "system":
        return Wrench;
      case "schedule_change":
      case "leave_approved":
      case "leave_rejected":
        return CalendarClock;
      case "tuition":
        return ShieldAlert;
      case "exam":
      case "exam_submission":
        return Users;
      default:
        return Bell;
    }
  };

  // ── Render ─────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Thông báo quản trị
          </h1>
          <p className="text-muted-foreground">
            Bạn có{" "}
            <span className="font-semibold text-primary">{unreadCount}</span>{" "}
            thông báo chưa đọc
          </p>
        </div>
        <div className="flex gap-2">
          {/* Send Notification Dialog */}
          <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Send className="h-4 w-4" />
                Gửi thông báo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Gửi thông báo</DialogTitle>
                <DialogDescription>
                  Gửi thông báo đến người dùng trong hệ thống
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Target */}
                <div className="grid gap-2">
                  <Label htmlFor="target">Đối tượng nhận</Label>
                  <Select
                    value={formData.role || "all"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        role: value === "all" ? null : value,
                        userId: null,
                      }))
                    }
                  >
                    <SelectTrigger id="target">
                      <SelectValue placeholder="Chọn đối tượng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Tất cả người dùng
                      </SelectItem>
                      <SelectItem value="student">Học viên</SelectItem>
                      <SelectItem value="teacher">Giáo viên</SelectItem>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="grid gap-2">
                  <Label htmlFor="title">Tiêu đề</Label>
                  <Input
                    id="title"
                    placeholder="Nhập tiêu đề thông báo..."
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Content */}
                <div className="grid gap-2">
                  <Label htmlFor="content">Nội dung</Label>
                  <Textarea
                    id="content"
                    placeholder="Nhập nội dung thông báo..."
                    rows={4}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Severity */}
                <div className="grid gap-2">
                  <Label htmlFor="severity">Mức độ</Label>
                  <Select
                    value={formData.severity || "LOW"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, severity: value }))
                    }
                  >
                    <SelectTrigger id="severity">
                      <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">
                        🔵 Thấp — Chỉ In-App
                      </SelectItem>
                      <SelectItem value="MEDIUM">
                        🟡 Trung bình — In-App + Email
                      </SelectItem>
                      <SelectItem value="HIGH">
                        🔴 Cao — In-App + Email + SMS
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSendDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={sendMutation.isPending}
                  className="gap-2"
                >
                  {sendMutation.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Gửi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => markAllMutation.mutate()}
            disabled={unreadCount === 0 || markAllMutation.isPending}
          >
            <Check className="mr-2 h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      </div>

      {/* Notification Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="flex-wrap">
          {filters.map((filter) => (
            <TabsTrigger
              key={filter.key}
              value={filter.key}
              className="gap-2"
            >
              {filter.label}
              {filter.key === "all" && (
                <Badge variant="secondary">{notifications.length}</Badge>
              )}
              {filter.key === "unread" && unreadCount > 0 && (
                <Badge className="bg-destructive">{unreadCount}</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {filters.map((filter) => (
          <TabsContent
            key={filter.key}
            value={filter.key}
            className="mt-4 space-y-3"
          >
            {filterNotifications(filter.key).length > 0 ? (
              filterNotifications(filter.key).map((item) => {
                const meta = getTypeBadge(item.type || "");
                const Icon = getTypeIcon(item.type || "");

                return (
                  <Card
                    key={item.id}
                    className={
                      !item.read ? "border-primary/40 bg-primary/5" : ""
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.className}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-foreground">
                              {item.title}
                            </h3>
                            <Badge variant="outline">{meta.label}</Badge>
                            {!item.read && (
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.content}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {item.date} {item.time}
                          </p>
                        </div>

                        <div className="flex items-start gap-1">
                          {!item.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markReadMutation.mutate(item.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed p-10 text-center">
                <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground">Không có thông báo</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
