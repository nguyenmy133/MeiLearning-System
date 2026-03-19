import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Calendar, CreditCard, FileText, Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { useNotifications } from "../hooks/useNotifications";
import { notificationService } from "../services/notificationService";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "announcement":
    case "admin_broadcast":
      return <Megaphone className="h-5 w-5 text-info" />;
    case "payment":
    case "tuition":
      return <CreditCard className="h-5 w-5 text-warning" />;
    case "schedule":
    case "schedule_change":
      return <Calendar className="h-5 w-5 text-primary" />;
    case "document":
      return <FileText className="h-5 w-5 text-accent" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

const getNotificationBg = (type: string) => {
  switch (type) {
    case "announcement":
    case "admin_broadcast":
      return "bg-info/10";
    case "payment":
    case "tuition":
      return "bg-warning/10";
    case "schedule":
    case "schedule_change":
      return "bg-primary/10";
    case "document":
      return "bg-accent/10";
    default:
      return "bg-muted";
  }
};

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useNotifications();
  const { toast } = useToast();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // ── Mutations ──────────────────────────────────────────────────

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
      toast({
        title: "Đã đánh dấu tất cả",
        description: "Tất cả thông báo đã được đánh dấu là đã đọc",
      });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Thông báo
          </h1>
          <p className="text-muted-foreground mt-1">
            {isLoading 
              ? "Đang tải thông báo..." 
              : unreadCount > 0 
                ? `Bạn có ${unreadCount} thông báo chưa đọc` 
                : "Không có thông báo mới"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            Tất cả
            <Badge variant="secondary" className="ml-2 text-xs">{notifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Chưa đọc
            {unreadCount > 0 && (
              <Badge className="ml-2 text-xs">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {isLoading ? (
                <div className="p-12 text-center text-muted-foreground animate-pulse">
                  Đang tải...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  Không có thông báo nào.
                </div>
              ) : (
                notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) markReadMutation.mutate(notif.id);
                  }}
                  className={`p-4 hover:bg-secondary/50 transition-colors cursor-pointer ${
                    !notif.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getNotificationBg(notif.type)}`}>
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                            {notif.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notif.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{notif.date} {notif.time}</p>
                    </div>
                  </div>
                </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-4">
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {notifications.filter(n => !n.read).length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Không có thông báo chưa đọc</p>
                </div>
              ) : (
                notifications.filter(n => !n.read).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markReadMutation.mutate(notif.id)}
                    className="p-4 bg-primary/5 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getNotificationBg(notif.type)}`}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-foreground">{notif.title}</p>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notif.content}
                            </p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{notif.date} {notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
