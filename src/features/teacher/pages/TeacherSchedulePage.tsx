import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  QrCode 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWeekSessions } from "@/features/admin/schedule/hooks";

// MOCK: current logged-in teacher ID — swap for auth context when BE is ready
const CURRENT_TEACHER_ID = 1;

const weekDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
// JS Date.getDay(): 0=Sun,1=Mon,...,6=Sat → map to weekDays index (0=Mon,...,6=Sun)
const jsDay2Index = (d: number) => (d === 0 ? 6 : d - 1);

export function TeacherSchedulePage() {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(() => {
    const now = new Date();
    const mon = new Date(now);
    mon.setDate(now.getDate() - jsDay2Index(now.getDay()));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    return `${fmt(mon)} - ${fmt(sun)}/${sun.getFullYear()}`;
  });
  const today = new Date().getDay();
  const currentDayIndex = jsDay2Index(today);

  const { data: sessions = [], isLoading } = useWeekSessions(undefined, CURRENT_TEACHER_ID);

  // Group sessions by weekday index (0=Mon ... 6=Sun)
  const byDay: Record<number, typeof sessions> = {};
  sessions.forEach((s) => {
    const idx = jsDay2Index(new Date(s.date).getDay());
    if (!byDay[idx]) byDay[idx] = [];
    byDay[idx].push(s);
  });

  const totalHours = sessions.reduce((sum, s) => {
    const [sh, sm] = s.startTime.split(":").map(Number);
    const [eh, em] = s.endTime.split(":").map(Number);
    return sum + (eh * 60 + em - (sh * 60 + sm)) / 60;
  }, 0);
  const uniqueClasses = new Set(sessions.map((s) => s.classId)).size;
  const uniqueStudents = sessions.reduce((max, s) => Math.max(max, s.students), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Lịch dạy</h1>
          <p className="text-muted-foreground">Quản lý lịch giảng dạy của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek((w) => w)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 bg-accent rounded-lg font-medium text-sm">
            {currentWeek}
          </div>
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek((w) => w)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="week" className="space-y-4">
        <TabsList>
          <TabsTrigger value="week">Tuần</TabsTrigger>
          <TabsTrigger value="list">Danh sách</TabsTrigger>
        </TabsList>

        <TabsContent value="week">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
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
                    {(byDay[index] ?? []).length > 0 ? (
                      (byDay[index] ?? []).map((cls) => (
                        <div 
                          key={cls.id} 
                          className="p-2 bg-primary/10 rounded-lg border-l-2 border-primary"
                        >
                          <p className="font-medium text-sm text-foreground">{cls.className}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            {cls.startTime}–{cls.endTime}
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
          )}
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-4 space-y-3">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
                : sessions.map((cls) => {
                    const dayIdx = jsDay2Index(new Date(cls.date).getDay());
                    return (
                      <div 
                        key={cls.id} 
                        className="flex items-center gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary mb-0.5" />
                          <span className="text-[10px] font-medium text-primary">{weekDays[dayIdx]}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{cls.className}</h4>
                            <Badge variant="secondary" className="text-xs">{cls.room}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {cls.startTime}–{cls.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {cls.students} học viên
                            </span>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => navigate("/teacher/attendance")}>
                          <QrCode className="w-4 h-4 mr-1" />
                          Điểm danh
                        </Button>
                      </div>
                    );
                  })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{sessions.length}</div>
            <p className="text-sm text-muted-foreground">Buổi/tuần</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{totalHours.toFixed(0)}</div>
            <p className="text-sm text-muted-foreground">Giờ/tuần</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{uniqueClasses}</div>
            <p className="text-sm text-muted-foreground">Lớp phụ trách</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{uniqueStudents}</div>
            <p className="text-sm text-muted-foreground">Học viên (tối đa/buổi)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}