import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeacherAttendanceHistory } from "./TeacherAttendanceHistory";
import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  QrCode,
  Clock,
  Users,
  UserX,
  UserCheck,
  Save,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { useTeacherSessions, useSessionAttendance, useSaveAttendance, useGenerateQrToken } from "../hooks";
import type { AttendeeRecord, AttendanceStatus, SaveAttendanceDTO } from "../types";
import { ATTENDANCE_STATUS_LABELS } from "../types";
import { QRCodeSVG } from "qrcode.react";

// Helpers
const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const getTodayISO = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** Issue #7: Kiểm tra session đã đến giờ chưa (cho phép trước 5 phút) */
const isSessionStarted = (startTime: string) => {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= toMinutes(startTime) - 5;
};

const formatCheckinTime = (timeStr: string | null | undefined) => {
  if (!timeStr) return "";
  const base = timeStr.split('.')[0];
  return base.length === 5 ? `${base}:00` : base;
};

// ── localStorage persistence for QR state ───────────────────────────────────
const QR_STORAGE_KEY = "teacher_qr_state";

interface StoredQrState {
  sessionId: number;
  token: string;
  expiresAt: string; // ISO
}

function saveQrState(state: StoredQrState) {
  try { localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(state)); } catch {}
}
function loadQrState(): StoredQrState | null {
  try {
    const raw = localStorage.getItem(QR_STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as StoredQrState;
    // Check if expired
    if (new Date(state.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(QR_STORAGE_KEY);
      return null;
    }
    return state;
  } catch { return null; }
}
function clearQrState() {
  try { localStorage.removeItem(QR_STORAGE_KEY); } catch {}
}

export function TeacherAttendancePage() {
  const { toast } = useToast();

  // ── Restore from localStorage on mount (instant, no network) ────────────
  const saved = loadQrState();

  const [selectedSessionId, setSelectedSessionId] = useState<number>(() => {
    // Ưu tiên: QR state > sessionStorage > 0
    if (saved?.sessionId) return saved.sessionId;
    try {
      const stored = sessionStorage.getItem("teacher_selected_session");
      return stored ? Number(stored) : 0;
    } catch { return 0; }
  });
  const [qrActive, setQrActive] = useState(!!saved);
  const [countdown, setCountdown] = useState(() => {
    if (!saved) return 0;
    return Math.max(0, Math.floor((new Date(saved.expiresAt).getTime() - Date.now()) / 1000));
  });
  const [qrTokenValue, setQrTokenValue] = useState(saved?.token ?? "");
  const [draftEdits, setDraftEdits] = useState<Record<string, Partial<AttendeeRecord>>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const generateQr = useGenerateQrToken();

  // ── Fetch today's sessions (scoped to current teacher by service) ───────────
  const { data: rawSessions = [], isLoading: sessionsLoading } = useTeacherSessions(getTodayISO());
  const sessions = rawSessions.filter((s) => s.status !== "cancelled");

  // ── Fetch attendees for selected session ───────────────────────────────────
  const { data: sessionData, isLoading: sessionLoading } = useSessionAttendance(selectedSessionId, qrActive);
  const saveAttendance = useSaveAttendance();

  // Compute combination of server data and uncommitted local edits
  const localAttendees = useMemo(() => {
    if (!sessionData || !Array.isArray(sessionData)) return [];
    return sessionData.map((serverData) => {
      const draft = draftEdits[serverData.studentId];
      if (!draft) return serverData;
      
      // If server updated to non-pending (e.g. valid QR scan) AND draft was just a fallback
      if (serverData.status !== "pending" && serverData.method === "qr" && draft.status === "absent" && !draft.checkinTime) {
        return serverData; // Server wins over stale draft
      }

      return { ...serverData, ...draft };
    });
  }, [sessionData, draftEdits]);

  // Clear drafts when changing session
  useEffect(() => {
    setDraftEdits({});
  }, [selectedSessionId]);

  // Auto-select first session if only one today (and no saved QR state)
  useEffect(() => {
    if (sessions.length === 1 && selectedSessionId === 0) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  // Persist selectedSessionId qua refresh (independent from QR state)
  useEffect(() => {
    try {
      if (selectedSessionId > 0) {
        sessionStorage.setItem("teacher_selected_session", String(selectedSessionId));
      } else {
        sessionStorage.removeItem("teacher_selected_session");
      }
    } catch {}
  }, [selectedSessionId]);

  // ── Fallback: check BE for active QR when selecting a session without local state
  useEffect(() => {
    // Skip if we already have QR from localStorage or if no session selected
    if (selectedSessionId <= 0 || qrActive) return;
    let cancelled = false;
    (async () => {
      try {
        const { getActiveQrToken } = await import("../services/attendanceService");
        const active = await getActiveQrToken(selectedSessionId);
        if (cancelled || !active) return;
        const remaining = Math.floor((new Date(active.expiresAt).getTime() - Date.now()) / 1000);
        if (remaining > 0) {
          setQrTokenValue(active.token);
          setCountdown(remaining);
          setQrActive(true);
          saveQrState({ sessionId: selectedSessionId, token: active.token, expiresAt: active.expiresAt });
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId]);

  // ── QR Countdown ───────────────────────────────────────────────────────────
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (qrActive && countdown > 0) {
      timer = setInterval(() => setCountdown((p) => p - 1), 1000);
    } else if (countdown === 0 && qrActive) {
      setQrActive(false);
      setQrTokenValue("");
      clearQrState();

      // Issue #6: Auto-update pending → absent và lưu nháp
      const newDrafts = { ...draftEdits };
      const updatedAttendees = localAttendees.map((a) => {
        if (a.status === "pending") {
          newDrafts[a.studentId] = { status: "absent", method: "manual", checkinTime: null };
          return { ...a, status: "absent" as AttendanceStatus };
        }
        return a;
      });
      setDraftEdits(newDrafts);

      // Auto-save draft nếu có session được chọn
      if (selectedSessionId > 0) {
        const draftPayload: SaveAttendanceDTO = {
          sessionId: selectedSessionId,
          attendees: updatedAttendees
            .filter((a) => a.status !== "pending")
            .map((a) => ({
              studentId: String(Number(a.studentId) || a.studentId),
              status: a.status,
              method: a.method ?? "manual",
            })),
          confirm: false,
        };
        saveAttendance.mutate(draftPayload, {
          onSuccess: () => {
            setDraftEdits({}); // Sync back to pure server state
            toast({
              title: "Mã QR đã hết hạn",
              description: "Đã tự động lưu nháp. Vui lòng kiểm tra và sửa trước khi chốt.",
            });
          },
          onError: () => {
            toast({ title: "Mã QR đã hết hạn", description: "Không thể lưu nháp tự động. Bấm 'Lưu nháp' để lưu.", variant: "destructive" });
          },
        });
      } else {
        toast({ title: "Mã QR đã hết hạn", description: "Bấm 'Tạo lại' để tạo mã mới.", variant: "destructive" });
      }
    }
    return () => clearInterval(timer);
  }, [qrActive, countdown, toast, localAttendees, selectedSessionId, saveAttendance]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const selectedSession = sessions.find(
    (s) => s.id === selectedSessionId
  );
  // Derive confirmed status from session's status (completed = confirmed by bulkAttendance)
  const isConfirmed = selectedSession?.status === "completed";

  // Cho phép điểm danh khi: đã chọn session + đã đến giờ (15 phút trước startTime)
  const canAttend = selectedSessionId > 0 && !!selectedSession && isSessionStarted(selectedSession.startTime);

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
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    
    setDraftEdits(prev => ({
      ...prev,
      [studentId]: {
        status: newStatus,
        method: "manual",
        checkinTime: newStatus === "absent" || newStatus === "absent_excused" ? null : t,
      }
    }));
  };

  // Issue #8: Fix buildDTO — convert studentId to Number, filter pending
  const buildDTO = (confirm: boolean): SaveAttendanceDTO => {
    // Khi chốt (confirm=true), convert pending → absent
    const finalAttendees = confirm
      ? localAttendees.map((a) =>
          a.status === "pending" ? { ...a, status: "absent" as AttendanceStatus } : a
        )
      : localAttendees;

    return {
      sessionId: selectedSessionId,
      attendees: finalAttendees
        .filter((a) => a.status !== "pending") // Không gửi pending cho BE
        .map((a) => ({
          studentId: String(Number(a.studentId) || a.studentId),
          status: a.status,
          method: a.method ?? "manual",
        })),
      confirm,
    };
  };

  const handleSaveDraft = () => {
    if (!selectedSessionId) { toast({ title: "Chưa chọn buổi học", variant: "destructive" }); return; }
    saveAttendance.mutate(buildDTO(false), {
      onSuccess: () => setDraftEdits({})
    });
  };

  const handleConfirm = () => {
    if (!selectedSessionId) { toast({ title: "Chưa chọn buổi học", variant: "destructive" }); return; }
    setConfirmOpen(true);
  };

  const executeConfirm = () => {
    saveAttendance.mutate(buildDTO(true), {
      onSuccess: () => setDraftEdits({})
    });
    if (qrActive) { setQrActive(false); setCountdown(0); setQrTokenValue(""); clearQrState(); }
    setConfirmOpen(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold mb-1">Điểm danh</h1>
        <p className="text-muted-foreground">Quản lý điểm danh và lịch sử các buổi học</p>
      </div>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="attendance" className="gap-2"><QrCode className="w-4 h-4" />Điểm danh</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><History className="w-4 h-4" />Lịch sử</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-0 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={!canAttend || isConfirmed || saveAttendance.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Lưu nháp
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canAttend || isConfirmed || saveAttendance.isPending}
            className="btn-primary"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Chốt điểm danh
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận chốt điểm danh?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Sau khi chốt, bạn sẽ <strong>không thể chỉnh sửa</strong> điểm danh buổi học này.</p>
                <div className="grid grid-cols-2 gap-2 text-sm bg-accent rounded-lg p-3">
                  <div>✅ Có mặt: <strong>{present}</strong></div>
                  <div>⏰ Đi muộn: <strong>{late}</strong></div>
                  <div>📋 Có phép: <strong>{absentExcused}</strong></div>
                  <div>❌ Vắng: <strong>{absent}</strong></div>
                </div>
                {pending > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm">
                    <span className="text-destructive font-medium">⚠️ Còn {pending} học viên chưa điểm danh — sẽ bị tính là vắng mặt.</span>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={executeConfirm} className="btn-primary">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Xác nhận chốt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                        <SelectItem key={s.id} value={String(s.id)} disabled={s.status === "completed"}>
                          {s.className} · {s.startTime}–{s.endTime} · {s.room}
                          {s.status === "completed" && " (Đã chốt ✓)"}
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
                  {qrActive && qrTokenValue ? (
                    <>
                      <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm p-4">
                        <QRCodeSVG
                          value={`${window.location.origin}/user/qr-check-in?token=${qrTokenValue}`}
                          size={200}
                          level="M"
                          includeMargin={false}
                        />
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
                  ) : generateQr.isPending ? (
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto shadow-sm animate-spin">
                        <QrCode className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground text-sm">Đang tạo mã QR...</p>
                    </div>
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

              {/* QR Button — chỉ hiện khi QR chưa bật */}
              {!qrActive && (
              <div className="pt-2">
                  <Button
                    onClick={() => {
                      generateQr.mutate(selectedSessionId, {
                        onSuccess: (data) => {
                          setQrTokenValue(data.token);
                          setCountdown(data.expiryMinutes * 60);
                          setQrActive(true);
                          saveQrState({ sessionId: selectedSessionId, token: data.token, expiresAt: data.expiresAt });
                        },
                      });
                    }}
                    className="w-full btn-primary h-12 text-base"
                    disabled={!selectedSessionId || isConfirmed || generateQr.isPending || (selectedSession ? !isSessionStarted(selectedSession.startTime) : false)}
                    title={selectedSession && !isSessionStarted(selectedSession.startTime) ? "Chưa đến giờ học (có thể bật trước 5 phút)" : undefined}
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    {generateQr.isPending ? "Đang tạo..." : selectedSession && !isSessionStarted(selectedSession.startTime) ? "Chưa đến giờ" : "Hiển thị mã QR"}
                  </Button>
              </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Stats + Student list */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 shadow-sm flex flex-col justify-center">
              <span className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1">Đi muộn</span>
              <div className="flex items-end gap-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {late} <Clock className="w-5 h-5 mb-1 opacity-70" />
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
          <div className="relative">
            {/* Overlay khi chưa đến giờ điểm danh */}
            {selectedSessionId > 0 && !canAttend && !isConfirmed && (
              <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center gap-2">
                <Clock className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">Chưa đến giờ điểm danh</p>
                <p className="text-xs text-muted-foreground/70">Có thể bắt đầu trước giờ học 5 phút</p>
              </div>
            )}
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
                              ? `Lúc ${formatCheckinTime(student.checkinTime)} (${student.method === "qr" ? "QR" : "Ghi tay"})`
                              : ATTENDANCE_STATUS_LABELS[student.status]}
                          </div>
                        </div>
                      </div>

                      {/* Attendance action buttons — luôn hiển thị, kể cả khi QR active */}
                      <div className="flex items-center gap-1.5 sm:pl-4 sm:border-l border-border/50">
                        {qrActive && student.status === "pending" && (
                          <span className="text-xs text-muted-foreground italic mr-1.5 animate-pulse">Chờ quét…</span>
                        )}
                        {(["present", "late", "absent_excused", "absent"] as AttendanceStatus[]).map(
                          (s) => (
                            <Button
                              key={s}
                              size="sm"
                              variant={student.status === s ? "default" : "outline"}
                              className={`h-8 px-2 text-xs ${student.status === s ? "" : "text-muted-foreground"}`}
                              onClick={() => updateStudentStatus(student.studentId, s)}
                              disabled={isConfirmed || !canAttend}
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

        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <TeacherAttendanceHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
