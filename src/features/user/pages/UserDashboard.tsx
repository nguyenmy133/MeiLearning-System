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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, CreditCard, BookOpen, ChevronRight, CheckCircle2, QrCode, Camera, AlertCircle, Loader2 } from "lucide-react";
import { SchedulePage } from "./SchedulePage";
import { AttendancePage } from "./AttendancePage";

const upcomingClasses = [
  { id: 1, subject: "Toán", teacher: "Nguyễn Văn Toán", time: "14:00 - 16:00", room: "P.101" },
  { id: 2, subject: "Tiếng Anh", teacher: "Trần Thị Anh", time: "16:30 - 18:30", room: "P.205" },
];

function QRCheckInSheet({ open, onClose, className }: { open: boolean, onClose: () => void, className?: string }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setResult(Math.random() > 0.3 ? "success" : "error");
    }, 2000);
  };

  const reset = () => { setResult(null); setScanning(false); };
  const handleClose = () => { reset(); onClose(); };

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
            <Button onClick={handleScan} disabled={scanning} className="w-full max-w-sm h-12">
              {scanning ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Camera className="w-5 h-5 mr-2" />}
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
        <p className="opacity-90">Hôm nay bạn có {upcomingClasses.length} buổi học. Chúc bạn học tập hiệu quả!</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingClasses.length}</p>
                <p className="text-xs text-muted-foreground">Buổi học hôm nay</p>
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

      <QRCheckInSheet open={qrOpen} onClose={() => setQrOpen(false)} className={activeClass} />

      {/* Main Tabs blending Dashboard, Schedule, Attendance */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="schedule">Thời khóa biểu</TabsTrigger>
          <TabsTrigger value="attendance">Lịch sử điểm danh</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule" className="mt-0">
          <div className="bg-card border rounded-xl overflow-hidden p-0 relative">
             <div className="px-4 py-2 pt-0 [&>div>div:first-child>h1]:hidden [&>div>div:first-child>p]:hidden">
                <SchedulePage onCheckIn={(subject) => { setActiveClass(subject); setQrOpen(true); }} />
             </div>
          </div>
        </TabsContent>
        <TabsContent value="attendance" className="mt-0">
          <div className="bg-card border rounded-xl overflow-hidden p-0 relative">
             <div className="px-4 py-2 pt-0 [&>div>div:first-child>h1]:hidden [&>div>div:first-child>p]:hidden">
                <AttendancePage />
             </div>
          </div>
        </TabsContent>
      </Tabs>
      
    </div>
  );
}
