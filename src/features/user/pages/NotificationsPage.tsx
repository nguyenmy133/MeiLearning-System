import { useState } from "react";
import { Bell, CheckCheck, Calendar, CreditCard, FileText, AlertCircle, Megaphone, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const notifications = [
  {
    id: 1,
    type: "announcement",
    title: "Thông báo nghỉ lễ Giáng sinh",
    content: "Trung tâm sẽ nghỉ từ 24/12 đến 26/12/2024. Các lớp học sẽ được bù vào tuần sau.",
    time: "2 giờ trước",
    date: "16/12/2024",
    read: false
  },
  {
    id: 2,
    type: "payment",
    title: "Nhắc nhở thanh toán học phí",
    content: "Học phí tháng 12 của bạn còn 2.500.000đ chưa thanh toán. Hạn cuối: 20/12/2024.",
    time: "5 giờ trước",
    date: "16/12/2024",
    read: false
  },
  {
    id: 3,
    type: "schedule",
    title: "Đổi phòng học",
    content: "Lớp Lý 10-B ngày 18/12 sẽ được chuyển từ phòng 203 sang phòng 205.",
    time: "1 ngày trước",
    date: "15/12/2024",
    read: true
  },
  {
    id: 4,
    type: "document",
    title: "Tài liệu mới được cập nhật",
    content: "Giáo viên đã upload bài tập tuần 2 cho lớp Lý 10-B.",
    time: "1 ngày trước",
    date: "15/12/2024",
    read: true
  },
  {
    id: 5,
    type: "announcement",
    title: "Khảo sát chất lượng giảng dạy",
    content: "Mời bạn tham gia khảo sát để giúp chúng tôi cải thiện chất lượng dạy học.",
    time: "2 ngày trước",
    date: "14/12/2024",
    read: true
  },
  {
    id: 6,
    type: "schedule",
    title: "Lịch thi cuối kỳ",
    content: "Lịch thi cuối kỳ lớp Toán 10A: 25/12/2024 lúc 08:00.",
    time: "3 ngày trước",
    date: "13/12/2024",
    read: true
  },
  {
    id: 7,
    type: "payment",
    title: "Xác nhận thanh toán",
    content: "Chúng tôi đã nhận được khoản thanh toán 5.000.000đ của bạn. Cảm ơn bạn!",
    time: "5 ngày trước",
    date: "11/12/2024",
    read: true
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "announcement":
      return <Megaphone className="h-5 w-5 text-info" />;
    case "payment":
      return <CreditCard className="h-5 w-5 text-warning" />;
    case "schedule":
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
      return "bg-info/10";
    case "payment":
      return "bg-warning/10";
    case "schedule":
      return "bg-primary/10";
    case "document":
      return "bg-accent/10";
    default:
      return "bg-muted";
  }
};

export function NotificationsPage() {
  const [notifs, setNotifs] = useState(notifications);
  const { toast } = useToast();

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: "Đã đánh dấu tất cả",
      description: "Tất cả thông báo đã được đánh dấu là đã đọc",
    });
  };

  const markAsRead = (id: number) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: number) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
    toast({
      title: "Đã xóa thông báo",
      description: "Thông báo đã được xóa",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Thông báo
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : "Không có thông báo mới"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} className="gap-2">
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
            <Badge variant="secondary" className="ml-2 text-xs">{notifs.length}</Badge>
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
              {notifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-4">
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {notifs.filter(n => !n.read).length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Không có thông báo chưa đọc</p>
                </div>
              ) : (
                notifs.filter(n => !n.read).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
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
                        <p className="text-xs text-muted-foreground mt-2">{notif.time}</p>
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
