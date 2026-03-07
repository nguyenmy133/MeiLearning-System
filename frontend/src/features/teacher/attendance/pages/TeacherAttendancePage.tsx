import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  QrCode,
  RefreshCw,
  StopCircle,
  Clock,
  Users,
  UserX,
  UserCheck,
  Save,
  Maximize2,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { useTeacherSessions, useSessionAttendance, useSaveAttendance } from "../hooks";
import type { AttendeeRecord, AttendanceStatus, SaveAttendanceDTO, TeacherSession } from "../types";
import { ATTENDANCE_STATUS_LABELS } from "../types";

// Helpers
const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const getTodayISO = () => new Date().toISOString().split("T")[0];

export function TeacherAttendancePage() {
  const { toast } = useToast();
  const [selectedSessionId, setSelectedSessionId] = useState<number>(0);
  const [qrActive, setQrActive] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [localAttendees, setLocalAttendees] = useState<AttendeeRecord[]>([]);

  // ── Fetch today's sessions (scoped to current teacher by service) ───────────
  const { data: sessions = [], isLoading: sessionsLoading } = useTeacherSessions({
    date: getTodayISO(),
  });

  // ── Fetch attendees for selected session ───────────────────────────────────
  const { data: sessionData, isLoading: sessionLoading } = useSessionAttendance(selectedSessionId);
  const saveAttendance = useSaveAttendance();

  // Sync local state when session data loads
  useEffect(() => {
    if (sessionData?.attendees) {
      setLocalAttendees(sessionData.attendees);
    }
  }, [sessionData]);

  // Auto-select first session if only one today
  useEffect(() => {
    if (sessions.length === 1 && selectedSessionId === 0) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  // ── QR Countdown ───────────────────────────────────────────────────────────
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (qrActive && countdown > 0) {
      timer = setInterval(() => setCountdown((p) => p - 1), 1000);
    } else if (countdown === 0 && qrActive) {
      setQrActive(false);
      setCountdown(300);
      toast({ title: "Mã QR đã hết hạn", variant: "destructive" });
    }
    return () => clearInterval(timer);
  }, [qrActive, countdown, toast]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const selectedSession: TeacherSession | undefined = sessions.find(
    (s) => s.id === selectedSessionId
  );
  const isConfirmed = sessionData?.session.attendanceStatus === "confirmed";

  // Stats
  const total = localAttendees.length;
  const present = localAttendees.filter((a) => a.status === "present").length;
  const late = localAttendees.filter((a) => a.status === "late").length;
  const absentExcused = localAttendees.filter((a) => a.status === "absent_excused").length;
  const absent = localAttendees.filter((a) => a.status === "absent").length;
  const pending = localAttendees.filter((a) => a.status === "pending").length;
  const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  // ── Actions ────────────────────────────────────────────────────────────────
  const updateStudentStatus = (studentId: string, newStatus: AttendanceStatus) => {
    if (isConfirmed) return;
    setLocalAttendees((prev) =>
      prev.map((a) => {
        if (a.studentId !== studentId) return a;
        const now = new Date();
        const t = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        return {
          ...a,
          status: newStatus,
          method: "manual" as const,
          checkinTime: newStatus === "absent" || newStatus === "absent_excused" ? null : t,
        };
      })
    );
  };

  const buildDTO = (confirm: boolean): SaveAttendanceDTO => ({
    sessionId: selectedSessionId,
    attendees: localAttendees.map((a) => ({
      studentId: a.studentId,
      status: a.status,
      method: a.method ?? "manual",
    })),
    confirm,
  });

  const handleSaveDraft = () => {
    if (!selectedSessionId) { toast({ title: "Chưa chọn buổi học", variant: "destructive" }); return; }
    saveAttendance.mutate(buildDTO(false));
  };

  const handleConfirm = () => {
    if (!selectedSessionId) { toast({ title: "Chưa chọn buổi học", variant: "destructive" }); return; }
    if (pending > 0) {
      toast({
        title: `Còn ${pending} học viên chưa điểm danh`,
        description: "Khi chốt, những học viên này sẽ bị tính là vắng mặt.",
      });
    }
    saveAttendance.mutate(buildDTO(true));
    if (qrActive) { setQrActive(false); setCountdown(300); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">Điểm danh buổi học</h1>
          <p className="text-muted-foreground">Tạo mã QR hoặc điểm danh thủ công cho học viên</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={!selectedSessionId || isConfirmed || saveAttendance.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Lưu nháp
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedSessionId || isConfirmed || saveAttendance.isPending}
            className="btn-primary"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Chốt điểm danh
          </Button>
        </div>
      </div>

      {isConfirmed && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Buổi học này đã được chốt điểm danh. Không thể chỉnh sửa.
        </div>
      )}

      <div className="grid xl:grid-cols-[1fr_2fr] gap-6">
        {/* LEFT: Session selector + QR */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                Kiểm soát mã QR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Session selector — now picks specific session, not just class */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Chọn buổi học hôm nay
                </label>
                {sessionsLoading ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">Hôm nay không có buổi dạy nào.</p>
                ) : (
                  <Select
                    value={selectedSessionId ? String(selectedSessionId) : ""}
                    onValueChange={(v) => {
                      setSelectedSessionId(Number(v));
                      setQrActive(false);
                      setCountdown(300);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Chọn buổi học --" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.className} · {s.startTime}–{s.endTime} · {s.room}
                          {s.attendanceStatus === "confirmed" && " ✓"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* QR Display */}
              <div className="relative pt-2">
                <div
                  className={`aspect-square w-full max-w-[260px] mx-auto rounded-2xl flex flex-col items-center justify-center p-6 transition-all duration-300 ${
                    qrActive
                      ? countdown < 60
                        ? "bg-red-50 border-2 border-red-200"
                        : "bg-primary/5 border-2 border-primary/20"
                      : "bg-accent border-2 border-dashed border-border"
                  }`}
                >
                  {qrActive ? (
                    <>
                      <div className="absolute top-3 right-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm p-4">
                        <QrCode className="w-full h-full text-zinc-900" strokeWidth={1.5} />
                      </div>
                      <div
                        className={`flex items-center gap-2 text-2xl font-bold tracking-tight font-mono ${
                          countdown < 60 ? "text-red-500 animate-pulse" : "text-primary"
                        }`}
                      >
                        <Clock className="w-5 h-5" />
                        {formatTime(countdown)}
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto shadow-sm">
                        <QrCode className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm max-w-[200px] leading-relaxed">
                        Chọn buổi học, sau đó tạo mã để học viên quét.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Buttons */}
              <div className="flex gap-3 pt-2">
                {qrActive ? (
                  <>
                    <Button
                      onClick={() => { setQrActive(false); setCountdown(300); }}
                      variant="destructive"
                      className="flex-1"
                    >
                      <StopCircle className="w-4 h-4 mr-2" />
                      Đóng QR
                    </Button>
                    <Button
                      onClick={() => { setQrActive(true); setCountdown(300); }}
                      variant="outline"
                      className="flex-1"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Tạo lại
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => { setQrActive(true); setCountdown(300); }}
                    className="w-full btn-primary h-12 text-base"
                    disabled={!selectedSessionId || isConfirmed}
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    Hiển thị mã QR
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Stats + Student list */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-center">
              <span className="text-sm text-muted-foreground mb-1">Sĩ số lớp</span>
              <div className="flex items-end gap-2 text-2xl font-bold">
                {total} <Users className="w-5 h-5 text-muted-foreground mb-1" />
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 shadow-sm flex flex-col justify-center">
              <span className="text-sm text-primary font-medium mb-1">Có mặt</span>
              <div className="flex items-end gap-2 text-2xl font-bold text-primary">
                {present} <UserCheck className="w-5 h-5 mb-1 opacity-70" />
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4 shadow-sm flex flex-col justify-center">
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Có phép</span>
              <div className="flex items-end gap-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {absentExcused} <UserCheck className="w-5 h-5 mb-1 opacity-70" />
              </div>
            </div>
            <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-4 shadow-sm flex flex-col justify-center">
              <span className="text-sm text-destructive font-medium mb-1">Vắng / Chưa tới</span>
              <div className="flex items-end gap-2 text-2xl font-bold text-destructive">
                {absent + pending} <UserX className="w-5 h-5 mb-1 opacity-70" />
              </div>
            </div>
          </div>

          {/* Progress */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border/50 bg-accent/30">
              <span className="text-sm font-medium">Tiến độ điểm danh buổi học</span>
              <span className="text-sm font-bold text-primary">{attendanceRate}%</span>
            </div>
            <Progress value={attendanceRate} className="h-2 rounded-none" />
          </Card>

          {/* Student list */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-display">Danh sách chi tiết</CardTitle>
              {pending > 0 && (
                <Badge variant="outline" className="bg-accent text-muted-foreground">
                  Còn {pending} bạn chưa điểm danh
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {!selectedSessionId ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  Vui lòng chọn buổi học ở bên trái.
                </p>
              ) : sessionLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {localAttendees.map((student) => (
                    <div
                      key={student.studentId}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-colors ${
                        student.status === "present" ? "bg-primary/5 border-primary/20" :
                        student.status === "late" ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200" :
                        student.status === "absent_excused" ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200" :
                        student.status === "absent" ? "bg-destructive/5 border-destructive/20" :
                        "bg-card border-border/50 hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        <div
                          className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center ${
                            student.status === "present" ? "bg-primary text-primary-foreground" :
                            student.status === "late" ? "bg-yellow-500 text-white" :
                            student.status === "absent_excused" ? "bg-blue-500 text-white" :
                            student.status === "absent" ? "bg-destructive text-destructive-foreground" :
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {student.status === "present" || student.status === "late" ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground text-[15px]">
                            {student.name}
                          </span>
                          {student.absenceCount >= 3 && (
                            <Badge variant="destructive" className="ml-2 text-[10px] py-0">
                              Vắng {student.absenceCount}x
                            </Badge>
                          )}
                          <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                            {student.checkinTime
                              ? `Lúc ${student.checkinTime} (${student.method === "qr" ? "QR" : "Ghi tay"})`
                              : ATTENDANCE_STATUS_LABELS[student.status]}
                          </div>
                        </div>
                      </div>

                      {/* Attendance action buttons */}
                      <div className="flex items-center gap-1.5 sm:pl-4 sm:border-l border-border/50">
                        {(["present", "late", "absent_excused", "absent"] as AttendanceStatus[]).map(
                          (s) => (
                            <Button
                              key={s}
                              size="sm"
                              variant={student.status === s ? "default" : "outline"}
                              className={`h-8 px-2 text-xs ${student.status === s ? "" : "text-muted-foreground"}`}
                              onClick={() => updateStudentStatus(student.studentId, s)}
                              disabled={isConfirmed}
                              title={ATTENDANCE_STATUS_LABELS[s]}
                            >
                              {s === "present" ? "Có mặt" :
                               s === "late" ? "Muộn" :
                               s === "absent_excused" ? "Có phép" : "Vắng"}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
