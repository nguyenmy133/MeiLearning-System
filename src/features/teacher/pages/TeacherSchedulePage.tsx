import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  QrCode 
} from "lucide-react";

const weekDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

const weeklySchedule = [
  { day: 0, classes: [
    { id: 1, name: "Toán 10A", time: "14:00 - 16:00", room: "P.101", students: 8 },
    { id: 2, name: "Toán 12B", time: "16:30 - 18:30", room: "P.102", students: 10 },
  ]},
  { day: 1, classes: [
    { id: 3, name: "Toán 11A", time: "14:00 - 16:00", room: "P.103", students: 12 },
  ]},
  { day: 2, classes: [
    { id: 4, name: "Toán 10A", time: "14:00 - 16:00", room: "P.101", students: 8 },
    { id: 5, name: "Toán 10B", time: "18:00 - 20:00", room: "P.104", students: 9 },
  ]},
  { day: 3, classes: [
    { id: 6, name: "Toán 12B", time: "16:30 - 18:30", room: "P.102", students: 10 },
  ]},
  { day: 4, classes: [
    { id: 7, name: "Toán 11A", time: "14:00 - 16:00", room: "P.103", students: 12 },
    { id: 8, name: "Toán 10B", time: "18:00 - 20:00", room: "P.104", students: 9 },
  ]},
  { day: 5, classes: [
    { id: 9, name: "Ôn thi THPT", time: "08:00 - 11:00", room: "P.201", students: 15 },
  ]},
  { day: 6, classes: [] },
];

const monthlyCalendar = [
  { date: "2024-01-15", sessions: 2 },
  { date: "2024-01-16", sessions: 1 },
  { date: "2024-01-17", sessions: 2 },
  { date: "2024-01-18", sessions: 1 },
  { date: "2024-01-19", sessions: 2 },
  { date: "2024-01-20", sessions: 1 },
  { date: "2024-01-22", sessions: 2 },
  { date: "2024-01-23", sessions: 1 },
  { date: "2024-01-24", sessions: 2 },
  { date: "2024-01-25", sessions: 1 },
  { date: "2024-01-26", sessions: 2 },
  { date: "2024-01-27", sessions: 1 },
];

export function TeacherSchedulePage() {
  const [currentWeek, setCurrentWeek] = useState("15/01 - 21/01/2024");
  const today = new Date().getDay();
  const currentDayIndex = today === 0 ? 6 : today - 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Lịch dạy</h1>
          <p className="text-muted-foreground">Quản lý lịch giảng dạy của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 bg-accent rounded-lg font-medium text-sm">
            {currentWeek}
          </div>
          <Button variant="outline" size="icon">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="week" className="space-y-4">
        <TabsList>
          <TabsTrigger value="week">Tuần</TabsTrigger>
          <TabsTrigger value="month">Tháng</TabsTrigger>
          <TabsTrigger value="list">Danh sách</TabsTrigger>
        </TabsList>

        <TabsContent value="week">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((day, index) => (
              <Card 
                key={day} 
                className={`${index === currentDayIndex ? "ring-2 ring-primary" : ""}`}
              >
                <CardHeader className="p-3 pb-2">
                  <CardTitle className={`text-sm font-medium ${index === currentDayIndex ? "text-primary" : "text-muted-foreground"}`}>
                    {day}
                    {index === currentDayIndex && (
                      <Badge className="ml-2 bg-primary text-xs">Hôm nay</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  {weeklySchedule[index]?.classes.length > 0 ? (
                    weeklySchedule[index].classes.map((cls) => (
                      <div 
                        key={cls.id} 
                        className="p-2 bg-primary/10 rounded-lg border-l-2 border-primary"
                      >
                        <p className="font-medium text-sm text-foreground">{cls.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {cls.time}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {cls.room}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-4 text-center">Không có lớp</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="month">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">Tháng 1, 2024</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((day) => (
                  <div key={day} className="p-2 text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const dayNum = i - 0 + 1;
                  const dateStr = `2024-01-${String(dayNum).padStart(2, "0")}`;
                  const hasSession = monthlyCalendar.find(d => d.date === dateStr);
                  
                  if (dayNum < 1 || dayNum > 31) return <div key={i} />;
                  
                  return (
                    <div 
                      key={i} 
                      className={`p-2 rounded-lg relative cursor-pointer hover:bg-accent transition-colors ${
                        dayNum === 15 ? "bg-primary text-primary-foreground" : ""
                      }`}
                    >
                      <span className="text-sm">{dayNum}</span>
                      {hasSession && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: hasSession.sessions }).map((_, j) => (
                              <div key={j} className="w-1.5 h-1.5 rounded-full bg-primary" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-4 space-y-3">
              {weeklySchedule.flatMap((dayData, dayIndex) =>
                dayData.classes.map((cls) => (
                  <div 
                    key={cls.id} 
                    className="flex items-center gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary mb-0.5" />
                      <span className="text-[10px] font-medium text-primary">{weekDays[dayIndex]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{cls.name}</h4>
                        <Badge variant="secondary" className="text-xs">{cls.room}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {cls.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {cls.students} học viên
                        </span>
                      </div>
                    </div>
                    <Button size="sm">
                      <QrCode className="w-4 h-4 mr-1" />
                      Điểm danh
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">12</div>
            <p className="text-sm text-muted-foreground">Buổi/tuần</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">24</div>
            <p className="text-sm text-muted-foreground">Giờ/tuần</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">5</div>
            <p className="text-sm text-muted-foreground">Lớp phụ trách</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">45</div>
            <p className="text-sm text-muted-foreground">Học viên</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
