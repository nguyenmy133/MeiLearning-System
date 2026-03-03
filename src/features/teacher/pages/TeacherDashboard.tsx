import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, QrCode, ChevronRight, TrendingUp } from "lucide-react";

const todayClasses = [
  { id: 1, name: "Toán 10A", time: "14:00 - 16:00", students: 8, room: "P.101" },
  { id: 6, name: "Lý 10-B", time: "16:30 - 18:30", students: 10, room: "P.102" },
];

export function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
        <h2 className="text-2xl font-display font-bold mb-2">Chào mừng, Thầy An!</h2>
        <p className="opacity-90">Hôm nay bạn có 2 lớp cần dạy. Chúc buổi giảng dạy thành công!</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">Lớp hôm nay</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">45</p>
                <p className="text-xs text-muted-foreground">Tổng học viên</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">120</p>
                <p className="text-xs text-muted-foreground">Giờ dạy tháng này</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">96%</p>
                <p className="text-xs text-muted-foreground">Chuyên cần TB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-display">Lịch dạy hôm nay</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayClasses.map((cls) => (
            <div key={cls.id} className="flex items-center gap-4 p-4 rounded-lg bg-accent/50">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{cls.name}</h4>
                  <Badge variant="secondary" className="text-xs">{cls.room}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{cls.time} • {cls.students} học viên</p>
              </div>
              <Button className="btn-primary">
                <QrCode className="w-4 h-4 mr-2" />
                Tạo QR điểm danh
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
