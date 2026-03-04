import { useState, useMemo } from "react";
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
  QrCode,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWeekSessions } from "@/features/admin/schedule/hooks";

// MOCK: current logged-in teacher ID — swap for auth context when BE is ready
const CURRENT_TEACHER_ID = 1;

const weekDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

// JS Date.getDay(): 0=Sun,1=Mon,...,6=Sat → map to weekDays index (0=Mon,...,6=Sun)
const jsDay2Index = (d: number) => (d === 0 ? 6 : d - 1);

/** Parse "HH:MM" → total minutes from midnight */
const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** Get Monday (00:00:00) of the week containing `date` */
function getMondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - jsDay2Index(d.getDay()));
  return d;
}

/** Format "DD/MM - DD/MM/YYYY" */
function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(monday)} - ${fmt(sunday)}/${sunday.getFullYear()}`;
}

type AttendanceStatus = "done" | "missed" | "ongoing" | "upcoming" | "future";

function getSessionStatus(
  sessionDate: string,
  startTime: string,
  endTime: string
): AttendanceStatus {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const sDate = new Date(sessionDate);
  sDate.setHours(0, 0, 0, 0);

  const diff = sDate.getTime() - todayMidnight.getTime();

  if (diff < 0) {
    // Past days — mock: ID divisible by 5 = missed, rest = done
    return Number(sessionDate.replace(/-/g, "")) % 5 === 0 ? "missed" : "done";
  }

  if (diff === 0) {
    // Today — determine by current time
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const startMin = toMinutes(startTime);
    const endMin = toMinutes(endTime);
    if (nowMin < startMin) return "upcoming";
    if (nowMin <= endMin) return "ongoing";
    return "done";
  }

  return "future";
}

const statusConfig: Record<
  AttendanceStatus,
  { label: string; className: string; icon?: React.ReactNode }
> = {
  done: {
    label: "Đã điểm danh",
    className: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  missed: {
    label: "Chưa điểm danh",
    className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  ongoing: {
    label: "Đang diễn ra",
    className: "bg-primary text-primary-foreground animate-pulse",
  },
  upcoming: {
    label: "Sắp vào lớp",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  future: { label: "", className: "" },
};

export function TeacherSchedulePage() {
  const navigate = useNavigate();

  // ✅ FIX: dùng Date state thay vì string — prev/next tuần hoạt động đúng
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOf(new Date()));

  const prevWeek = () =>
    setWeekStart((d) => {
      const nd = new Date(d);
      nd.setDate(d.getDate() - 7);
      return nd;
    });

  const nextWeek = () =>
    setWeekStart((d) => {
      const nd = new Date(d);
      nd.setDate(d.getDate() + 7);
      return nd;
    });

  const goToday = () => setWeekStart(getMondayOf(new Date()));

  const isCurrentWeek =
    getMondayOf(new Date()).toDateString() === weekStart.toDateString();

  const todayDayIndex = jsDay2Index(new Date().getDay());

  const { data: sessions = [], isLoading } = useWeekSessions(undefined, CURRENT_TEACHER_ID);

  // Filter sessions to the selected week
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [weekStart]);

  const weekSessions = useMemo(
    () =>
      sessions.filter((s) => {
        const sd = new Date(s.date);
        return sd >= weekStart && sd <= weekEnd;
      }),
    [sessions, weekStart, weekEnd]
  );

  // Group by weekday index (relative to Monday of selected week)
  const byDay = useMemo(() => {
    const map: Record<number, typeof sessions> = {};
    weekSessions.forEach((s) => {
      const idx = jsDay2Index(new Date(s.date).getDay());
      if (!map[idx]) map[idx] = [];
      map[idx].push(s);
    });
    return map;
  }, [weekSessions]);

  // ── Summary stats ──
  const totalHours = weekSessions.reduce((sum, s) => {
    const [sh, sm] = s.startTime.split(":").map(Number);
    const [eh, em] = s.endTime.split(":").map(Number);
    return sum + (eh * 60 + em - (sh * 60 + sm)) / 60;
  }, 0);
  const uniqueClasses = new Set(weekSessions.map((s) => s.classId)).size;
  const totalStudents = weekSessions.reduce((sum, s) => sum + s.students, 0);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Lịch dạy</h1>
          <p className="text-muted-foreground">Quản lý lịch giảng dạy của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek} title="Tuần trước">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 bg-accent rounded-lg font-medium text-sm min-w-[170px] text-center">
            {formatWeekLabel(weekStart)}
          </div>
          <Button variant="outline" size="icon" onClick={nextWeek} title="Tuần sau">
            <ChevronRight className="w-4 h-4" />
          </Button>
          {!isCurrentWeek && (
            <Button variant="ghost" size="sm" onClick={goToday} className="text-primary text-xs">
              Về hôm nay
            </Button>
          )}
        </div>
      </div>

      {/* ── Stat cards — di chuyển LÊN TRÊN Tabs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : weekSessions.length}
            </div>
            <p className="text-sm text-muted-foreground">Buổi/tuần</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : totalHours.toFixed(0)}
            </div>
            <p className="text-sm text-muted-foreground">Giờ/tuần</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : uniqueClasses}
            </div>
            <p className="text-sm text-muted-foreground">Lớp phụ trách</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : totalStudents}
            </div>
            <p className="text-sm text-muted-foreground">Tổng học viên/tuần</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="week" className="space-y-4">
        <TabsList>
          <TabsTrigger value="week">Theo tuần</TabsTrigger>
          <TabsTrigger value="list">Danh sách</TabsTrigger>
        </TabsList>

        {/* Week grid */}
        <TabsContent value="week">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weekDays.map((day, index) => {
                const isToday = isCurrentWeek && index === todayDayIndex;
                return (
                  <Card
                    key={day}
                    className={isToday ? "ring-2 ring-primary" : ""}
                  >
                    <CardHeader className="p-3 pb-2">
                      <CardTitle
                        className={`text-sm font-medium flex items-center gap-1 ${
                          isToday ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {day}
                        {isToday && (
                          <Badge className="ml-1 bg-primary text-[10px] px-1.5 py-0">
                            Hôm nay
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2">
                      {(byDay[index] ?? []).length > 0 ? (
                        (byDay[index] ?? []).map((cls) => {
                          const status = getSessionStatus(cls.date, cls.startTime, cls.endTime);
                          const cfg = statusConfig[status];
                          return (
                            <div
                              key={cls.id}
                              className="p-2 bg-primary/10 rounded-lg border-l-2 border-primary space-y-1"
                            >
                              <p className="font-medium text-sm text-foreground leading-tight">
                                {cls.className}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {cls.startTime}–{cls.endTime}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {cls.room}
                              </div>
                              {/* Badge trạng thái điểm danh */}
                              {status !== "future" && cfg.label && (
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${cfg.className}`}
                                >
                                  {cfg.icon}
                                  {cfg.label}
                                </span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground py-4 text-center">
                          Không có lớp
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* List tab */}
        <TabsContent value="list">
          <Card>
            <CardContent className="p-4 space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))
              ) : weekSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Không có buổi học nào trong tuần này.
                </p>
              ) : (
                weekSessions
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime() ||
                      toMinutes(a.startTime) - toMinutes(b.startTime)
                  )
                  .map((cls) => {
                    const dayIdx = jsDay2Index(new Date(cls.date).getDay());
                    const status = getSessionStatus(cls.date, cls.startTime, cls.endTime);
                    const cfg = statusConfig[status];
                    const isMissed = status === "missed";

                    return (
                      <div
                        key={cls.id}
                        className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                          isMissed
                            ? "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"
                            : "bg-accent/50 hover:bg-accent"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-primary mb-0.5" />
                          <span className="text-[10px] font-medium text-primary">
                            {weekDays[dayIdx]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-foreground">{cls.className}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {cls.room}
                            </Badge>
                            {/* Badge trạng thái điểm danh */}
                            {status !== "future" && cfg.label && (
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.className}`}
                              >
                                {cfg.icon}
                                {cfg.label}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {cls.startTime}–{cls.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {cls.students} học viên
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={isMissed ? "destructive" : "default"}
                          onClick={() => navigate("/teacher/attendance")}
                        >
                          <QrCode className="w-4 h-4 mr-1" />
                          Điểm danh
                        </Button>
                      </div>
                    );
                  })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}