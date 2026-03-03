import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Calendar, Clock, CreditCard, BookOpen, Bell, ChevronRight, CheckCircle, QrCode, Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const upcomingClasses = [
  { id: 1, subject: "Toán học", teacher: "Thầy An", time: "14:00 - 16:00", room: "P.101" },
  { id: 2, subject: "Tiếng Anh", teacher: "Cô Bích", time: "16:30 - 18:30", room: "P.205" },
];

const notifications = [
  { id: 1, title: "Lịch học thay đổi", content: "Lớp Toán ngày 20/12 chuyển sang P.102", time: "2 giờ trước" },
  { id: 2, title: "Học phí tháng 12", content: "Nhắc nhở đóng học phí trước ngày 25/12", time: "1 ngày trước" },
];

// ── QR Check-in Sheet (inline, no page navigation needed) ─────────────────────
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
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setResult(Math.random() > 0.3 ? "success" : "error");
    }, 2000);
  };

  const reset = () => {
    setResult(null);
    setScanning(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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
          {/* Scanner area */}
          <div className="w-full max-w-sm aspect-square rounded-2xl bg-accent/50 flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
            {scanning ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <p className="text-muted-foreground">Đang quét mã QR...</p>
              </div>
            ) : result === "success" ? (
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Điểm danh thành công!</h3>
                <p className="text-muted-foreground mb-4">Buổi học đã được ghi nhận</p>
                <Badge className="bg-primary/10 text-primary">Đúng giờ</Badge>
              </div>
            ) : result === "error" ? (
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Điểm danh thất bại</h3>
                <p className="text-muted-foreground mb-4">Mã QR đã hết hạn hoặc không hợp lệ</p>
                <Button onClick={reset} variant="outline">Thử lại</Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-10 h-10 text-primary" />
                </div>
                <p className="text-muted-foreground">Nhấn nút bên dưới để quét mã QR</p>
              </div>
            )}
          </div>

          {!result && (
            <Button
              onClick={handleScan}
              disabled={scanning}
              className="w-full max-w-sm h-12"
            >
              {scanning ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Camera className="w-5 h-5 mr-2" />
              )}
              {scanning ? "Đang xử lý..." : "Mở camera quét QR"}
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

export function UserDashboard() {
  const [qrOpen, setQrOpen] = useState(false);
  const [activeClass, setActiveClass] = useState("");

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
        <h2 className="text-2xl font-display font-bold mb-2">Chào mừng trở lại, Nguyễn Văn A!</h2>
        <p className="opacity-90">Hôm nay bạn có 2 buổi học. Chúc bạn học tập hiệu quả!</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">Buổi học hôm nay</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">95%</p>
                <p className="text-xs text-muted-foreground">Chuyên cần</p>
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
                <p className="text-2xl font-bold text-destructive">1.5M</p>
                <p className="text-xs text-muted-foreground">Công nợ</p>
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
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Lớp đang học</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-display">Lịch học hôm nay</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingClasses.map((cls) => (
              <div key={cls.id} className="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{cls.subject}</h4>
                    <Badge variant="secondary" className="text-xs">{cls.room}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{cls.teacher} • {cls.time}</p>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    className="btn-secondary"
                    onClick={() => { setActiveClass(cls.subject); setQrOpen(true); }}
                  >
                    Điểm danh
                  </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-display">Thông báo mới</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex gap-3 p-3 rounded-lg bg-accent/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{notif.title}</h4>
                  <p className="text-sm text-muted-foreground">{notif.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <QRCheckInSheet open={qrOpen} onClose={() => setQrOpen(false)} className={activeClass} />
    </div>
  );
}
