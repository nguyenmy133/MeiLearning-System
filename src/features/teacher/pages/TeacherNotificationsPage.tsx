import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Calendar,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Check,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

const notifications = [
  {
    id: 1,
    type: "schedule",
    title: "Lịch dạy đã được cập nhật",
    content: "Lịch dạy lớp Toán 10A ngày 20/01 đã được đổi sang ngày 21/01 theo yêu cầu của bạn.",
    time: "10 phút trước",
    read: false,
    icon: Calendar
  },
  {
    id: 2,
    type: "student",
    title: "Học viên mới đăng ký",
    content: "Học viên Nguyễn Thị D đã được thêm vào lớp Toán 11-Nâng cao.",
    time: "1 giờ trước",
    read: false,
    icon: Users
  },
  {
    id: 3,
    type: "system",
    title: "Nhắc nhở nhập điểm",
    content: "Vui lòng nhập điểm kiểm tra 15 phút cho lớp Lý 10-B trước ngày 25/01.",
    time: "2 giờ trước",
    read: false,
    icon: FileText
  },
  {
    id: 4,
    type: "alert",
    title: "Học viên vắng nhiều",
    content: "Học viên Hoàng Thị Em (Toán 10A) đã vắng 3 buổi liên tiếp. Vui lòng liên hệ phụ huynh.",
    time: "5 giờ trước",
    read: true,
    icon: AlertCircle
  },
  {
    id: 5,
    type: "system",
    title: "Yêu cầu đổi lịch được duyệt",
    content: "Yêu cầu hủy buổi dạy lớp Lý 10-B ngày 20/01 đã được phê duyệt.",
    time: "1 ngày trước",
    read: true,
    icon: CheckCircle
  },
  {
    id: 6,
    type: "info",
    title: "Cập nhật hệ thống",
    content: "Hệ thống sẽ bảo trì từ 22:00 - 24:00 ngày 25/01. Vui lòng hoàn thành công việc trước thời gian này.",
    time: "2 ngày trước",
    read: true,
    icon: Info
  },
  {
    id: 7,
    type: "schedule",
    title: "Buổi học sắp diễn ra",
    content: "Lớp Toán 10A sẽ bắt đầu trong 30 phút tại phòng P.101.",
    time: "3 ngày trước",
    read: true,
    icon: Clock
  }
];

export function TeacherNotificationsPage() {
  const [notificationList, setNotificationList] = useState(notifications);
  
  const unreadCount = notificationList.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotificationList(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotificationList(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    toast.success("Đã đánh dấu tất cả là đã đọc");
  };

  const deleteNotification = (id: number) => {
    setNotificationList(prev => prev.filter(n => n.id !== id));
    toast.success("Đã xóa thông báo");
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "schedule":
        return "bg-info/10 text-info";
      case "student":
        return "bg-primary/10 text-primary";
      case "alert":
        return "bg-destructive/10 text-destructive";
      case "system":
        return "bg-success/10 text-success";
      default:
        return "bg-accent text-muted-foreground";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "schedule":
        return "Lịch dạy";
      case "student":
        return "Học viên";
      case "alert":
        return "Cảnh báo";
      case "system":
        return "Hệ thống";
      default:
        return "Thông tin";
    }
  };

  const filterNotifications = (filter: string) => {
    if (filter === "all") return notificationList;
    if (filter === "unread") return notificationList.filter(n => !n.read);
    return notificationList.filter(n => n.type === filter);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Thông báo</h1>
          <p className="text-muted-foreground">
            Bạn có <span className="text-primary font-medium">{unreadCount}</span> thông báo chưa đọc
          </p>
        </div>
        <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
          <Check className="w-4 h-4 mr-2" />
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">
            Tất cả
            <Badge variant="secondary" className="ml-2">{notificationList.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Chưa đọc
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-destructive">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="schedule">Lịch dạy</TabsTrigger>
          <TabsTrigger value="student">Học viên</TabsTrigger>
          <TabsTrigger value="alert">Cảnh báo</TabsTrigger>
        </TabsList>

        {["all", "unread", "schedule", "student", "alert"].map((filter) => (
          <TabsContent key={filter} value={filter} className="space-y-3 mt-4">
            {filterNotifications(filter).length > 0 ? (
              filterNotifications(filter).map((notification) => {
                const Icon = notification.icon;
                return (
                  <Card 
                    key={notification.id} 
                    className={`transition-colors hover:bg-accent/50 ${!notification.read ? "border-primary/30 bg-primary/5" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                              {notification.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(notification.type)}
                            </Badge>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {notification.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
