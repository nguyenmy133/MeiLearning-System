import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Users,
  Clock,
  ChevronRight,
  TrendingUp,
  MapPin,
  AlarmClock,
  ClipboardList,
  FileText,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWeekSessions } from "@/features/admin/schedule/hooks";

import { authService } from "@/features/shared/auth/authService";

import { usePendingTasks, useAttendanceRate } from "../hooks/useDashboard";

const jsDay2Index = (d: number) => (d === 0 ? 6 : d - 1);

/** Parse "HH:MM" → total minutes from midnight */
const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** Format minutes-remaining into human-readable string */
const formatCountdown = (diffMin: number): string => {
  if (diffMin <= 0) return "Đang diễn ra";
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  if (h > 0) return `${h}g ${m}p nữa`;
  return `${m} phút nữa`;
};

type SessionTimeStatus = "ongoing" | "done" | "upcoming";

function getTimeStatus(startTime: string, endTime: string, nowMin: number): SessionTimeStatus {
  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);
  if (nowMin >= startMin && nowMin <= endMin) return "ongoing";
  if (nowMin > endMin) return "done";
  return "upcoming";
}

export function TeacherDashboard() {
  const navigate = useNavigate();
  const TEACHER_ID = authService.getCurrentTeacherId();
  const user = authService.getCurrentUser();
  const { data: sessions = [], isLoading } = useWeekSessions(undefined, TEACHER_ID);
  
  const { data: pendingTasks = [], isLoading: isTasksLoading } = usePendingTasks();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: attendanceRate = 0, isLoading: isRateLoading } = useAttendanceRate();

  const now = new Date();
  const todayIndex = jsDay2Index(now.getDay());
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Sessions happening today, sorted by start time
  const todaySessions = sessions
    .filter((s) => jsDay2Index(new Date(s.date).getDay()) === todayIndex)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  // Total students to attend today (sum)
  const todayStudents = todaySessions.reduce((sum, s) => sum + s.students, 0);

  // Next upcoming or ongoing class today
  const nextSession = todaySessions.find((s) => toMinutes(s.endTime) > nowMin);
  const nextSessionDiff = nextSession ? toMinutes(nextSession.startTime) - nowMin : null;
  const nextSessionLabel = nextSession
    ? nextSessionDiff !== null && nextSessionDiff <= 0
      ? `${nextSession.className} — Đang diễn ra`
      : `${nextSession.className} (${formatCountdown(nextSessionDiff ?? 0)})`
    : "Không còn lớp hôm nay";

  const urgentCount = pendingTasks.filter((t) => t.urgent).length;

  return (
    <div className="space-y-6">
      {/* ── Greeting banner ── */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
        <h2 className="text-2xl font-display font-bold mb-1">Chào mừng, {user?.name ?? "Giáo viên"}!</h2>
        <p className="opacity-90">
          {isLoading
            ? "Đang tải lịch dạy..."
            : todaySessions.length > 0
            ? `Hôm nay bạn có ${todaySessions.length} lớp cần dạy. Chúc buổi giảng dạy thành công!`
            : "Hôm nay bạn không có lớp. Hãy nghỉ ngơi và chuẩn bị cho buổi sau!"}
        </p>
        {urgentCount > 0 && (
          <p className="opacity-80 text-sm mt-1">
            ⚠️ Có {urgentCount} việc cần xử lý khẩn cấp hôm nay.
          </p>
        )}
      </div>

      {/* ── Stat cards — TODAY focused ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Lớp hôm nay */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "—" : todaySessions.length}</p>
                <p className="text-xs text-muted-foreground">Lớp hôm nay</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Buổi tiếp theo */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                <AlarmClock className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate leading-tight">
                  {isLoading ? "—" : nextSessionLabel}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Buổi tiếp theo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. HV điểm danh hôm nay */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "—" : todayStudents}</p>
                <p className="text-xs text-muted-foreground">HV điểm danh hôm nay</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Việc cần xử lý ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            Việc cần xử lý
            {urgentCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground text-xs">
                {urgentCount} khẩn
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isTasksLoading ? (
            <div className="flex justify-center p-4">
               <span className="text-muted-foreground animate-pulse">Đang tải công việc...</span>
            </div>
          ) : pendingTasks.length > 0 ? (
            pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-accent/40 hover:bg-accent transition-colors cursor-pointer group"
                onClick={() => navigate(task.href)}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${task.badgeClass}`}
                >
                  <task.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{task.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{task.sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Tất cả việc đã xong!</p>
          )}
        </CardContent>
      </Card>

      {/* ── Lịch dạy hôm nay ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-display">Lịch dạy hôm nay</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() => navigate("/teacher/schedule")}
          >
            Xem cả tuần <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          ) : todaySessions.length > 0 ? (
            todaySessions.map((cls) => {
              const status = getTimeStatus(cls.startTime, cls.endTime, nowMin);
              const isOngoing = status === "ongoing";
              const isDone = status === "done";

              return (
                <div
                  key={cls.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                    isOngoing
                      ? "bg-primary/10 border border-primary/30"
                      : isDone
                      ? "bg-muted/40 opacity-60"
                      : "bg-accent/50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground">{cls.className}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {cls.room}
                      </Badge>
                      {isOngoing && (
                        <Badge className="text-xs bg-primary animate-pulse">Đang diễn ra</Badge>
                      )}
                      {isDone && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã điểm danh
                        </span>
                      )}
                      {!isOngoing && !isDone && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400">
                          <AlertCircle className="w-3 h-3" />
                          Chưa điểm danh
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {cls.startTime}–{cls.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {cls.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {cls.students} học viên
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              Không có lớp nào hôm nay 🎉
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
