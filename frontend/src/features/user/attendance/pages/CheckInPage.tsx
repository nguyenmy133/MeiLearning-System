import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Camera, CheckCircle, AlertCircle, Loader2, Keyboard } from "lucide-react";
import { useCheckIn } from "@/features/user/attendance/hooks";
import { useTodaySessions } from "@/features/user/schedule/hooks";

export function CheckInPage() {
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");

  const [qrCode, setQrCode] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState(sessionIdParam ?? "");
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const checkIn = useCheckIn();
  const { data: todaySessions = [] } = useTodaySessions();

  // Filter sessions that can be checked in
  const checkableSessions = todaySessions.filter((s) => s.canCheckIn);

  const handleCheckIn = () => {
    if (!qrCode.trim()) {
      setErrorMsg("Vui lòng nhập mã QR");
      return;
    }

    const sid = selectedSessionId || checkableSessions[0]?.id;
    if (!sid) {
      setErrorMsg("Không có buổi học nào để điểm danh");
      return;
    }

    setResult(null);
    setErrorMsg("");

    checkIn.mutate(
      { qrCode: qrCode.trim(), sessionId: sid },
      {
        onSuccess: () => {
          setResult("success");
        },
        onError: (err: Error) => {
          setResult("error");
          setErrorMsg(err.message || "Mã QR đã hết hạn hoặc không hợp lệ");
        },
      }
    );
  };

  const resetScan = () => {
    setResult(null);
    setQrCode("");
    setErrorMsg("");
  };

  const activeSession = todaySessions.find((s) => s.id === selectedSessionId) ?? checkableSessions[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold mb-2">Điểm danh QR</h1>
        <p className="text-muted-foreground">Quét mã QR từ giáo viên để điểm danh buổi học</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-display">Điểm danh buổi học</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Result area */}
          <div className="aspect-square rounded-2xl bg-accent/50 flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
            {checkIn.isPending ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <p className="text-muted-foreground">Đang điểm danh...</p>
              </div>
            ) : result === "success" ? (
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Điểm danh thành công!</h3>
                {activeSession && (
                  <p className="text-muted-foreground mb-4">
                    Bạn đã điểm danh buổi học {activeSession.className}
                  </p>
                )}
                <Badge className="bg-primary/10 text-primary">Đúng giờ</Badge>
              </div>
            ) : result === "error" ? (
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Điểm danh thất bại</h3>
                <p className="text-muted-foreground mb-4">{errorMsg || "Mã QR đã hết hạn hoặc không hợp lệ"}</p>
                <Button onClick={resetScan} variant="outline">Thử lại</Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-10 h-10 text-primary" />
                </div>
                <p className="text-muted-foreground">Nhập mã QR từ giáo viên để điểm danh</p>
              </div>
            )}
          </div>

          {/* QR Code input */}
          {!result && (
            <div className="space-y-4">
              {/* Session selection — if multiple sessions available */}
              {checkableSessions.length > 1 && (
                <div className="space-y-2">
                  <Label>Buổi học</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                  >
                    {checkableSessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.className} — {s.startTime}-{s.endTime}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Show current session info */}
              {activeSession && (
                <div className="p-3 bg-primary/5 rounded-lg text-sm">
                  <p className="font-medium text-foreground">{activeSession.className}</p>
                  <p className="text-muted-foreground">
                    {activeSession.startTime} - {activeSession.endTime} • Phòng {activeSession.room}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="qr-code">Mã QR</Label>
                <div className="flex gap-2">
                  <Input
                    id="qr-code"
                    placeholder="Nhập mã QR từ giáo viên..."
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCheckIn()}
                  />
                  <Button
                    onClick={handleCheckIn}
                    disabled={checkIn.isPending || !qrCode.trim()}
                    className="shrink-0"
                  >
                    {checkIn.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Keyboard className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errorMsg && !result && (
                  <p className="text-xs text-destructive">{errorMsg}</p>
                )}
              </div>
            </div>
          )}

          {result === "success" && (
            <Button onClick={resetScan} className="w-full" variant="outline">
              Điểm danh buổi khác
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Today's sessions info */}
      {checkableSessions.length === 0 && !result && (
        <Card className="max-w-md mx-auto border-amber-200/50 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 dark:text-amber-300">
                Hiện tại không có buổi học nào cần điểm danh. Điểm danh chỉ mở khi buổi học đang diễn ra.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="max-w-md mx-auto">
        <CardContent className="p-4">
          <h4 className="font-semibold text-foreground mb-2">Hướng dẫn điểm danh</h4>
          <ol className="text-sm text-muted-foreground space-y-2">
            <li>1. Chờ giáo viên tạo mã QR điểm danh</li>
            <li>2. Nhập mã QR vào ô bên trên hoặc quét bằng camera</li>
            <li>3. Mã QR chỉ có hiệu lực trong 5 phút</li>
            <li>4. Điểm danh sau 10 phút kể từ giờ học sẽ được tính là đi muộn</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
