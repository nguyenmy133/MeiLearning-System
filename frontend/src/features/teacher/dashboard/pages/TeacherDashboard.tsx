import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Users,
  Clock,
  ChevronRight,
  MapPin,
  AlarmClock,
  ClipboardList,
  FileText,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  UserX,
  BarChart3,
  QrCode,
  FileCheck,
  Upload,
  Bell,
  Timer,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTeacherSchedule } from "@/features/teacher/schedule/hooks/useTeacherSchedule";
import { useAuth } from "@/features/shared/auth/auth-context";
import {
  usePendingTasks,
  useTodayAttendanceStats,
  useTeacherExamsForDashboard,
  useRecentNotifications,
} from "../hooks/useDashboard";

// ── Helpers ───────────────────────────────────────────────────────────────────

const jsDay2Index = (d: number) => (d === 0 ? 6 : d - 1);

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

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

function getProgressPercent(startTime: string, endTime: string, nowMin: number): number {
  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);
  if (nowMin <= startMin) return 0;
  if (nowMin >= endMin) return 100;
  return Math.round(((nowMin - startMin) / (endMin - startMin)) * 100);
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: sessions = [], isLoading } = useTeacherSchedule();

  const { data: pendingTasks = [], isLoading: isTasksLoading } = usePendingTasks();
  const { data: attendanceStats, isLoading: isStatsLoading } = useTodayAttendanceStats();
  const { data: exams = [], isLoading: isExamsLoading } = useTeacherExamsForDashboard();
  const { data: notifications = [], isLoading: isNotiLoading } = useRecentNotifications();

  const now = new Date();
  const todayIndex = jsDay2Index(now.getDay());
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Sessions hôm nay, sorted by start time
  const todaySessions = sessions
    .filter((s) => jsDay2Index(new Date(s.date).getDay()) === todayIndex)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  const todayStudents = todaySessions.reduce((sum, s) => sum + s.students, 0);

  // Next session
  const nextSession = todaySessions.find((s) => toMinutes(s.endTime) > nowMin);
  const nextSessionDiff = nextSession ? toMinutes(nextSession.startTime) - nowMin : null;
  const nextSessionLabel = nextSession
    ? nextSessionDiff !== null && nextSessionDiff <= 0
      ? `${nextSession.className} — Đang diễn ra`
      : `${nextSession.className} (${formatCountdown(nextSessionDiff ?? 0)})`
    : "Không còn lớp hôm nay";

  // Exam stats
  const ongoingExams = exams.filter((e) => e.status === "ongoing");
  const upcomingExams = exams.filter((e) => e.status === "upcoming" || e.status === "published");
  const activeExamCount = ongoingExams.length + upcomingExams.length;

  // Exams sắp hết hạn (endTime trong 48h tới)
  const expiringExams = exams.filter((e) => {
    if (!e.endTime || e.status === "ended" || e.status === "archived" || e.status === "draft") return false;
    const endDate = new Date(e.endTime);
    const hoursLeft = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft <= 48;
  });

  // Attendance stats
  const attRate = attendanceStats?.rate ?? 0;
  const attTotal = attendanceStats?.total ?? 0;
  const attPresent = attendanceStats?.present ?? 0;
  const attAbsent = attendanceStats?.absent ?? 0;
  const attLate = attendanceStats?.late ?? 0;

  const urgentCount = pendingTasks.filter((t) => t.urgent).length;

  // Show full skeleton while essential data loads
  if (isLoading && isTasksLoading && isStatsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Greeting Banner ── */}
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

      {/* ── 2. Stat Cards (4 columns) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lớp hôm nay */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "—" : todaySessions.length}</p>
                <p className="text-xs text-muted-foreground">Lớp hôm nay</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Buổi tiếp theo */}
        <Card className="hover:shadow-md transition-shadow">
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

        {/* Card 3: Tỷ lệ điểm danh */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {isStatsLoading ? "—" : `${attRate}%`}
                </p>
                <p className="text-xs text-muted-foreground">Tỷ lệ điểm danh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Bài thi đang mở */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/teacher/exams")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {isExamsLoading ? "—" : activeExamCount}
                </p>
                <p className="text-xs text-muted-foreground">Bài thi đang mở</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Quick Actions ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: QrCode, label: "Điểm danh", href: "/teacher/attendance", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
          { icon: FileCheck, label: "Tạo bài thi", href: "/teacher/exams", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
          { icon: Upload, label: "Upload tài liệu", href: "/teacher/documents", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
          { icon: BarChart3, label: "Điểm & nhận xét", href: "/teacher/grades", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
        ].map((action) => (
          <button
            key={action.href}
            onClick={() => navigate(action.href)}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border hover:bg-accent hover:shadow-md transition-all group"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
              <action.icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{action.label}</span>
          </button>
        ))}
      </div>

      {/* ── 4. Lịch dạy hôm nay (2/3) + Điểm danh hôm nay (1/3) ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline lịch dạy */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-primary" />
              Lịch dạy hôm nay
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => navigate("/teacher/schedule")}
            >
              Xem cả tuần <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))
            ) : todaySessions.length > 0 ? (
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-border" />

                {todaySessions.map((cls, idx) => {
                  const status = getTimeStatus(cls.startTime, cls.endTime, nowMin);
                  const isOngoing = status === "ongoing";
                  const isDone = status === "done";
                  const progress = isOngoing ? getProgressPercent(cls.startTime, cls.endTime, nowMin) : 0;

                  return (
                    <div
                      key={cls.id}
                      className={`relative flex items-start gap-4 p-3 rounded-lg transition-all cursor-pointer hover:bg-accent/60 ${
                        isOngoing
                          ? "bg-primary/5 border border-primary/20"
                          : isDone
                          ? "opacity-60"
                          : ""
                      }`}
                      onClick={() => navigate("/teacher/attendance")}
                    >
                      {/* Timeline dot */}
                      <div className="relative z-10 mt-1.5 shrink-0">
                        <div
                          className={`w-3 h-3 rounded-full border-2 ${
                            isOngoing
                              ? "bg-primary border-primary animate-pulse"
                              : isDone
                              ? "bg-muted-foreground/40 border-muted-foreground/40"
                              : "bg-background border-primary/50"
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-foreground text-sm">{cls.className}</h4>
                          <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
                            {cls.room}
                          </Badge>
                          {isOngoing && (
                            <Badge className="text-[11px] bg-primary animate-pulse px-1.5 py-0">Đang diễn ra</Badge>
                          )}
                          {isDone && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0 rounded-full border bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Hoàn thành
                            </span>
                          )}
                          {!isOngoing && !isDone && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0 rounded-full border bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400">
                              <AlertCircle className="w-3 h-3" />
                              Chưa điểm danh
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
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

                        {/* Progress bar for ongoing session */}
                        {isOngoing && (
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-1.5 flex-1" />
                            <span className="text-[11px] text-muted-foreground shrink-0">{progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Không có lớp nào hôm nay 🎉
              </p>
            )}
          </CardContent>
        </Card>

        {/* Attendance Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              Điểm danh hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isStatsLoading ? (
              <div className="space-y-3 py-4">
                <Skeleton className="h-12 w-24 mx-auto" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                <div className="text-center py-2">
                  <p className="text-4xl font-bold text-foreground">
                    {attPresent}
                    <span className="text-xl text-muted-foreground font-normal">
                      /{attTotal}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Học viên có mặt</p>
                  <Progress value={attRate} className="mt-3 h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tỉ lệ:{" "}
                    <span className="font-semibold text-primary">{attRate}%</span>
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: UserCheck, label: "Có mặt", value: attPresent, color: "text-primary" },
                    { icon: Clock, label: "Đi muộn", value: attLate, color: "text-amber-500" },
                    { icon: UserX, label: "Vắng mặt", value: attAbsent, color: "text-destructive" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/40"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </div>
                      <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── 5. Việc cần xử lý (1/2) + Bài thi của tôi (1/2) ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
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
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/40 hover:bg-accent transition-colors cursor-pointer group"
                  onClick={() => navigate(task.href)}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${task.badgeClass}`}>
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
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Tất cả việc đã xong!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exam Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" />
              Bài thi của tôi
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs"
              onClick={() => navigate("/teacher/exams")}
            >
              Xem tất cả <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {isExamsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : [...ongoingExams, ...upcomingExams].length > 0 ? (
              [...ongoingExams.slice(0, 2), ...upcomingExams.slice(0, 2)]
                .slice(0, 3)
                .map((exam) => {
                  const isOngoing = exam.status === "ongoing";
                  return (
                    <div
                      key={exam.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-accent ${
                        isOngoing ? "bg-primary/5 border border-primary/20" : "bg-accent/40"
                      }`}
                      onClick={() => navigate(`/teacher/exams`)}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          isOngoing ? "bg-primary animate-pulse" : "bg-amber-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{exam.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <Badge
                            className={`text-[10px] px-1.5 py-0 border-0 ${
                              isOngoing
                                ? "bg-primary/10 text-primary"
                                : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {isOngoing ? "Đang diễn ra" : "Sắp diễn ra"}
                          </Badge>
                          {isOngoing && (
                            <span>
                              {exam.completedStudents}/{exam.totalStudents} đã nộp
                            </span>
                          )}
                          {!isOngoing && exam.startTime && (
                            <span>
                              {new Date(exam.startTime).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-6">
                <BookOpen className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Không có bài thi đang mở</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── 6. Thông báo gần đây (1/2) + Bài thi sắp hết hạn (1/2) ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Thông báo gần đây
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs"
              onClick={() => navigate("/teacher/notifications")}
            >
              Xem tất cả <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {isNotiLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((noti) => (
                <div
                  key={noti.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-accent ${
                    !noti.read ? "bg-primary/5 border-l-2 border-l-primary" : "bg-accent/30"
                  }`}
                  onClick={() => navigate("/teacher/notifications")}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      noti.type === "schedule"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : noti.type === "payment"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                        : noti.type === "document"
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {noti.type === "schedule" ? (
                      <Calendar className="w-3.5 h-3.5" />
                    ) : noti.type === "document" ? (
                      <FileText className="w-3.5 h-3.5" />
                    ) : (
                      <Bell className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${!noti.read ? "font-semibold text-foreground" : "text-foreground/80"}`}>
                      {noti.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{noti.content}</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                      {noti.date ? formatRelativeTime(noti.date) : noti.time}
                    </p>
                  </div>
                  {!noti.read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Bell className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Không có thông báo mới</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exams expiring soon */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-500" />
              Bài thi sắp hết hạn
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs"
              onClick={() => navigate("/teacher/exams")}
            >
              Xem tất cả <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {isExamsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : expiringExams.length > 0 ? (
              expiringExams.slice(0, 4).map((exam) => {
                const endDate = new Date(exam.endTime);
                const hoursLeft = Math.max(0, Math.round((endDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
                const isUrgent = hoursLeft <= 6;

                return (
                  <div
                    key={exam.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-accent ${
                      isUrgent ? "bg-destructive/5 border border-destructive/20" : "bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30"
                    }`}
                    onClick={() => navigate("/teacher/exams")}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isUrgent
                          ? "bg-destructive/10 text-destructive"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      <Timer className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{exam.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge
                          className={`text-[10px] px-1.5 py-0 border-0 ${
                            isUrgent
                              ? "bg-destructive/10 text-destructive"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {isUrgent ? `⚠️ Còn ${hoursLeft}h` : `Còn ${hoursLeft}h`}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {exam.completedStudents}/{exam.totalStudents} đã nộp
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Không có bài thi nào sắp hết hạn</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
