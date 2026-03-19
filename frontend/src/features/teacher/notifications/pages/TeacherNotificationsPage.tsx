import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  CalendarClock,
  Users,
  Wrench,
  ShieldAlert,
  Check,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "@/features/user/notifications/hooks/useNotifications";
import { notificationService } from "@/features/user/notifications/services/notificationService";

type NotificationType = "system" | "schedule_change" | "leave_approved" | "leave_rejected" | "admin_broadcast" | string;

const filters: Array<{ key: string; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "schedule", label: "Lịch dạy" },
  { key: "system", label: "Hệ thống" },
];

export function TeacherNotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useNotifications();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // ── Mutations ──────────────────────────────────────────────────

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
      toast.success("Đã đánh dấu tất cả là đã đọc");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
    },
  });

  // ── Helpers ────────────────────────────────────────────────────

  const filterNotifications = (filter: string) => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    const typeMap: Record<string, string[]> = {
      schedule: ["schedule_change", "leave_approved", "leave_rejected"],
      system: ["admin_broadcast", "system"],
    };
    const types = typeMap[filter] || [filter];
    return notifications.filter((item) => types.includes(item.type || ""));
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "schedule_change":
        return { label: "Lịch dạy", className: "bg-info/10 text-info" };
      case "leave_approved":
        return { label: "Duyệt nghỉ", className: "bg-success/10 text-success" };
      case "leave_rejected":
        return { label: "Từ chối nghỉ", className: "bg-destructive/10 text-destructive" };
      case "admin_broadcast":
      case "system":
        return { label: "Hệ thống", className: "bg-primary/10 text-primary" };
      default:
        return { label: "Thông báo", className: "bg-muted text-muted-foreground" };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "schedule_change":
        return CalendarClock;
      case "leave_approved":
      case "leave_rejected":
        return Users;
      case "admin_broadcast":
      case "system":
        return Wrench;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Thông báo</h1>
          <p className="text-muted-foreground">
            Bạn có <span className="text-primary font-medium">{unreadCount}</span> thông báo chưa đọc
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => markAllMutation.mutate()}
          disabled={unreadCount === 0 || markAllMutation.isPending}
        >
          <Check className="w-4 h-4 mr-2" />
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap">
          {filters.map((filter) => (
            <TabsTrigger key={filter.key} value={filter.key} className="gap-2">
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
          <TabsContent key={filter.key} value={filter.key} className="space-y-3 mt-4">
            {filterNotifications(filter.key).length > 0 ? (
              filterNotifications(filter.key).map((item) => {
                const meta = getTypeBadge(item.type || "");
                const Icon = getTypeIcon(item.type || "");

                return (
                  <Card
                    key={item.id}
                    className={`transition-colors hover:bg-accent/50 ${
                      !item.read ? "border-primary/30 bg-primary/5" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.className}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className={`font-medium ${
                                !item.read ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {item.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {meta.label}
                            </Badge>
                            {!item.read && (
                              <span className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {item.date} {item.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!item.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => markReadMutation.mutate(item.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Không có thông báo nào</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
