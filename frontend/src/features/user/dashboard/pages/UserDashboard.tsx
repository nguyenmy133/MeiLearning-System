import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CreditCard,
  BookOpen,
  CheckCircle2,
  QrCode,
  Camera,
  AlertCircle,
  Loader2,
  Clock,
  MapPin,
  ClipboardList,
} from "lucide-react";
import { SchedulePage } from "../../schedule/pages/SchedulePage";
import { AttendancePage } from "../../attendance/pages/AttendancePage";
import { useTodaySessions, useMyClasses } from "@/features/user/schedule/hooks";
import { useMyInvoices } from "@/features/user/tuition/hooks";
import { useQrTokenCheckIn } from "@/features/user/attendance/hooks";
import { useMyExams } from "@/features/user/exam/hooks";

// ── QR Check-in Sheet ─────────────────────────────────────────────────────────

function QRCheckInSheet({
  open,
  onClose,
  className,
}: {
  open: boolean;
  onClose: () => void;
  className?: string;
}) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<"success" | "error" | "expired" | "already" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef<any>(null);
  const scannerContainerId = "qr-reader-container";
  const checkIn = useQrTokenCheckIn();

  // Extract token from scanned QR value (URL format)
  const extractToken = (qrValue: string): string | null => {
    try {
      const url = new URL(qrValue);
      return url.searchParams.get("token");
    } catch {
      // If not a URL, treat the whole string as token
      return qrValue.length > 10 ? qrValue : null;
    }
  };

  const startScanner = async () => {
    setScanning(true);
    setCameraError("");
    setResult(null);

    // Dynamic import to avoid SSR issues
    const { Html5Qrcode } = await import("html5-qrcode");

    try {
      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // QR detected — stop scanner and process
          scanner.stop().catch(() => {});
          scannerRef.current = null;
          setScanning(false);

          const token = extractToken(decodedText);
          if (!token) {
            setResult("error");
            setErrorMsg("Mã QR không hợp lệ.");
            return;
          }

          checkIn.mutate(token, {
            onSuccess: () => setResult("success"),
            onError: (err: Error) => {
              const msg = err.message || "";
              if (msg.includes("hết hạn")) setResult("expired");
              else if (msg.includes("đã điểm danh")) setResult("already");
              else { setResult("error"); setErrorMsg(msg); }
            },
          });
        },
        () => {} // ignore scan errors (no QR found in frame)
      );
    } catch (err: any) {
      setScanning(false);
      setCameraError(
        err?.message?.includes("Permission")
          ? "Bạn cần cho phép quyền camera để quét QR."
          : "Không thể mở camera. Vui lòng thử trên thiết bị khác."
      );
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const reset = () => { setResult(null); setScanning(false); setErrorMsg(""); setCameraError(""); };
  const handleClose = () => { stopScanner(); reset(); onClose(); };

  // Cleanup on unmount
  useEffect(() => { return () => stopScanner(); }, []);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-display flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Điểm danh QR{className ? ` — ${className}` : ""}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center gap-6 pt-2">
          <div className="w-full max-w-sm aspect-square rounded-2xl bg-accent/50 flex items-center justify-center border-2 border-dashed border-border overflow-hidden relative">
            {/* Camera scanner container — always in DOM for html5-qrcode */}
            <div id={scannerContainerId} className={`w-full h-full ${scanning ? "" : "hidden"}`} />

            {!scanning && (result === "success" ? (
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Điểm danh thành công!</h3>
                <p className="text-muted-foreground mb-4">Buổi học đã được ghi nhận</p>
                <Badge className="bg-primary/10 text-primary">✓ Có mặt</Badge>
              </div>
            ) : result === "expired" ? (
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Mã QR đã hết hạn</h3>
                <p className="text-muted-foreground mb-4">Yêu cầu giáo viên tạo mã mới</p>
                <Button onClick={reset} variant="outline">Thử lại</Button>
              </div>
            ) : result === "already" ? (
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Đã điểm danh rồi</h3>
                <p className="text-muted-foreground mb-4">Bạn đã được ghi nhận trước đó</p>
              </div>
            ) : result === "error" ? (
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Điểm danh thất bại</h3>
                <p className="text-muted-foreground mb-4">{errorMsg || "Mã QR không hợp lệ"}</p>
                <Button onClick={reset} variant="outline">Thử lại</Button>
              </div>
            ) : checkIn.isPending ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <p className="text-muted-foreground">Đang điểm danh...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-10 h-10 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  {cameraError || "Nhấn nút bên dưới để mở camera quét QR"}
                </p>
                {cameraError && (
                  <p className="text-xs text-destructive mt-2">{cameraError}</p>
                )}
              </div>
            ))}
          </div>

          {!result && !checkIn.isPending && (
            <Button onClick={startScanner} disabled={scanning} className="w-full max-w-sm h-12">
              {scanning ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Camera className="w-5 h-5 mr-2" />}
              {scanning ? "Đang quét..." : "Mở camera quét QR"}
            </Button>
          )}
          {result === "success" && (
            <Button onClick={handleClose} className="w-full max-w-sm h-12">
              Hoàn thành
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export function UserDashboard() {
  const [qrOpen, setQrOpen] = useState(false);
  const [activeClass, setActiveClass] = useState("");
  const [activeSessionId, setActiveSessionId] = useState("");

  // ── Real data from services ─────────────────────────────────────────
  const { data: todaySessions = [] } = useTodaySessions();
  const { data: classes = [] } = useMyClasses();
  const { data: invoices = [] } = useMyInvoices();
  const { data: exams = [] } = useMyExams();

  const activeClasses = classes.filter((c) => c.status === "active");
  const pendingInvoices = invoices.filter((i) => i.status === "pending" || i.status === "overdue");
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  
  const totalDebt = pendingInvoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid = paidInvoices.reduce((s, i) => s + i.totalAmount, 0);

  // Compute pending exams
  const pendingExams = exams.filter((e) => e.status === "ongoing" && !e.mySubmittedAt);
  const pendingExamCount = pendingExams.length;

  const handleCheckIn = (className: string, sessionId: string) => {
    setActiveClass(className);
    setActiveSessionId(sessionId);
    setQrOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
        <h2 className="text-2xl font-display font-bold mb-2">Chào mừng trở lại!</h2>
        <p className="opacity-90">
          {todaySessions.length > 0
            ? `Hôm nay bạn có ${todaySessions.length} buổi học. Chúc bạn học tập hiệu quả!`
            : "Hôm nay bạn không có buổi học nào. Nghỉ ngơi thật tốt!"}
        </p>
      </div>

      {/* Stats cards — 4 columns including attendance rate */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todaySessions.length}</p>
                <p className="text-xs text-muted-foreground">Buổi học hôm nay</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${pendingExamCount > 0 ? "text-amber-500" : "text-emerald-600"}`}>
                  {pendingExamCount}
                </p>
                <p className="text-xs text-muted-foreground">{pendingExamCount > 0 ? "Bài chưa làm" : "Đã hoàn thành hết"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeClasses.length}</p>
                <p className="text-xs text-muted-foreground">Lớp đang học</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${totalDebt > 0 ? "text-destructive" : "text-success"}`}>
                  {totalDebt > 0
                    ? `${(totalDebt / 1_000_000).toFixed(1)}M`
                    : totalPaid > 0
                    ? `${(totalPaid / 1_000_000).toFixed(1)}M`
                    : "0"}
                </p>
                <p className="text-xs text-muted-foreground">{totalDebt > 0 ? "Công nợ học phí" : "Đã thanh toán"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section A — "Buổi học hôm nay" — prominent CTA section */}
      {todaySessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Buổi học hôm nay
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todaySessions.map((sess) => (
              <Card key={sess.id} className="border-l-[3px] border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-foreground">{sess.className}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {sess.startTime} - {sess.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {sess.room}
                        </span>
                      </div>
                      {(() => {
                        const status = sess.attendanceStatus?.toLowerCase();
                        
                        if (sess.canCheckIn) {
                          // Within check-in window → show QR button
                          return (
                            <div className="flex flex-col gap-2 items-start mt-1">
                              {status === "absent" && (
                                <Badge variant="outline" className="text-[10px] w-fit text-red-600 border-red-300 bg-red-50 dark:text-red-400 dark:border-red-700 dark:bg-red-900/30">
                                  Vắng không phép
                                </Badge>
                              )}
                              <Button size="sm" className="h-8 text-xs font-medium gap-1.5" onClick={() => handleCheckIn(sess.className, sess.id)}>
                                <QrCode className="w-3.5 h-3.5" />
                                {status === "absent" ? "Quét mã bổ sung" : "Điểm danh QR"}
                              </Button>
                            </div>
                          );
                        }

                        if (status) {
                          // Has attendance record → show status badge
                          const config = status === "present" ? { cls: "text-green-600 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-900/30", label: "✓ Đã có mặt" }
                            : status === "absent_excused" ? { cls: "text-blue-600 border-blue-300 bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:bg-blue-900/30", label: "Nghỉ có phép" }
                            : status === "late" ? { cls: "text-yellow-600 border-yellow-300 bg-yellow-50 dark:text-yellow-400 dark:border-yellow-700 dark:bg-yellow-900/30", label: "Đi muộn" }
                            : { cls: "text-red-600 border-red-300 bg-red-50 dark:text-red-400 dark:border-red-700 dark:bg-red-900/30", label: "Vắng không phép" };
                          return <Badge variant="outline" className={`text-xs w-fit mt-1 ${config.cls}`}>{config.label}</Badge>;
                        }
                        // Check if session already ended
                        const now = new Date();
                        const nowMin = now.getHours() * 60 + now.getMinutes();
                        const [eh, em] = (sess.endTime || "23:59").split(":").map(Number);
                        const endMin = eh * 60 + em;
                        if (nowMin > endMin) {
                          return <Badge variant="outline" className="text-xs text-muted-foreground">Đã kết thúc</Badge>;
                        }
                        return <Badge variant="outline" className="text-xs text-muted-foreground">Chưa đến giờ</Badge>;
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <QRCheckInSheet
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        className={activeClass}
      />

      {/* Section B — Tabs: Lịch tuần + Điểm danh */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="schedule">Lịch tuần</TabsTrigger>
          <TabsTrigger value="attendance">Lịch sử điểm danh</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule" className="mt-0">
          <div className="bg-card border rounded-xl overflow-hidden p-0 relative">
            <div className="px-4 py-2 pt-0">
              <SchedulePage onCheckIn={handleCheckIn} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="attendance" className="mt-0">
          <div className="bg-card border rounded-xl overflow-hidden p-0 relative">
            <div className="px-4 py-2 pt-0">
              <AttendancePage compact />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
