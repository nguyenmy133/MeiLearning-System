import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CalendarClock, Check, ShieldAlert, Trash2, Users, Wrench } from "lucide-react";
import { toast } from "sonner";

type NotificationType = "system" | "teacher" | "student" | "schedule";

type AdminNotification = {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  time: string;
  read: boolean;
};

const initialNotifications: AdminNotification[] = [
  {
    id: 1,
    type: "system",
    title: "Yêu cầu đổi lịch chờ duyệt",
    content: "Có 3 yêu cầu đổi lịch mới đang chờ bạn phê duyệt.",
    time: "10 phút trước",
    read: false,
  },
  {
    id: 2,
    type: "teacher",
    title: "Giáo viên xin nghỉ đột xuất",
    content: "Giáo viên Trần Văn B đã gửi đơn nghỉ ngày 08/03.",
    time: "40 phút trước",
    read: false,
  },
  {
    id: 3,
    type: "student",
    title: "Học viên mới đăng ký",
    content: "12 học viên mới vừa được nhập vào hệ thống.",
    time: "2 giờ trước",
    read: false,
  },
  {
    id: 4,
    type: "schedule",
    title: "Lịch học thay đổi",
    content: "Lịch phòng P.203 có xung đột vào khung 18:00 - 20:00.",
    time: "5 giờ trước",
    read: true,
  },
];

const filters: Array<{ key: "all" | "unread" | NotificationType; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "system", label: "Hệ thống" },
  { key: "teacher", label: "Giáo viên" },
  { key: "student", label: "Học viên" },
  { key: "schedule", label: "Lịch học" },
];

export function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    toast.success("Đã xóa thông báo");
  };

  const filterNotifications = (filter: "all" | "unread" | NotificationType) => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((item) => !item.read);
    return notifications.filter((item) => item.type === filter);
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case "system":
        return { label: "Hệ thống", className: "bg-primary/10 text-primary" };
      case "teacher":
        return { label: "Giáo viên", className: "bg-success/10 text-success" };
      case "student":
        return { label: "Học viên", className: "bg-info/10 text-info" };
      default:
        return { label: "Lịch học", className: "bg-warning/10 text-warning" };
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "system":
        return Wrench;
      case "teacher":
        return ShieldAlert;
      case "student":
        return Users;
      default:
        return CalendarClock;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Thông báo quản trị</h1>
          <p className="text-muted-foreground">
            Bạn có <span className="font-semibold text-primary">{unreadCount}</span> thông báo chưa đọc
          </p>
        </div>
        <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
          <Check className="mr-2 h-4 w-4" />
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap">
          {filters.map((filter) => (
            <TabsTrigger key={filter.key} value={filter.key} className="gap-2">
              {filter.label}
              {filter.key === "all" && <Badge variant="secondary">{notifications.length}</Badge>}
              {filter.key === "unread" && unreadCount > 0 && (
                <Badge className="bg-destructive">{unreadCount}</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {filters.map((filter) => (
          <TabsContent key={filter.key} value={filter.key} className="mt-4 space-y-3">
            {filterNotifications(filter.key).length > 0 ? (
              filterNotifications(filter.key).map((item) => {
                const meta = getTypeBadge(item.type);
                const Icon = getTypeIcon(item.type);

                return (
                  <Card key={item.id} className={!item.read ? "border-primary/40 bg-primary/5" : ""}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${meta.className}`}>
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-foreground">{item.title}</h3>
                            <Badge variant="outline">{meta.label}</Badge>
                            {!item.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{item.content}</p>
                          <p className="mt-2 text-xs text-muted-foreground">{item.time}</p>
                        </div>

                        <div className="flex items-start gap-1">
                          {!item.read && (
                            <Button variant="ghost" size="icon" onClick={() => markAsRead(item.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => deleteNotification(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
