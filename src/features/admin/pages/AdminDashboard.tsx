import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, GraduationCap, BookOpen, CreditCard, TrendingUp, TrendingDown, 
  ChevronRight, AlertTriangle, UserPlus 
} from "lucide-react";

const stats = [
  { label: "Tổng học viên", value: "1,234", change: "+12%", trend: "up", icon: Users },
  { label: "Giáo viên", value: "52", change: "+3", trend: "up", icon: GraduationCap },
  { label: "Lớp đang mở", value: "48", change: "-2", trend: "down", icon: BookOpen },
  { label: "Doanh thu tháng", value: "450M", change: "+8%", trend: "up", icon: CreditCard },
];

const alerts = [
  { type: "warning", message: "5 học viên vắng liên tiếp 3 buổi", action: "Xem danh sách" },
  { type: "info", message: "12 lead mới chờ xử lý", action: "Xem lead" },
  { type: "warning", message: "3 lớp có tỉ lệ vắng cao (>20%)", action: "Xem báo cáo" },
];

const recentLeads = [
  { id: 1, name: "Nguyễn Thị E", phone: "0901234567", need: "Luyện thi lớp 10", status: "new" },
  { id: 2, name: "Trần Văn F", phone: "0912345678", need: "Tiếng Anh giao tiếp", status: "contacted" },
  { id: 3, name: "Lê Thị G", phone: "0923456789", need: "Bổ trợ Toán 12", status: "new" },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                stat.trend === "up" ? "text-primary" : "text-destructive"
              }`}>
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
                <span className="text-muted-foreground">so với tháng trước</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-secondary" />
              Cảnh báo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  alert.type === "warning" ? "bg-secondary/20" : "bg-accent/50"
                }`}
              >
                <p className="text-sm text-foreground">{alert.message}</p>
                <Button variant="ghost" size="sm" className="text-primary">
                  {alert.action} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Lead mới
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                <div>
                  <p className="font-medium text-foreground">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.need}</p>
                </div>
                <Badge variant={lead.status === "new" ? "default" : "secondary"}>
                  {lead.status === "new" ? "Mới" : "Đã liên hệ"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
