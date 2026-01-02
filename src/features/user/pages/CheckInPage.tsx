import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Camera, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export function CheckInPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const handleScan = () => {
    setScanning(true);
    // Simulate QR scan
    setTimeout(() => {
      setScanning(false);
      setResult(Math.random() > 0.3 ? "success" : "error");
    }, 2000);
  };

  const resetScan = () => {
    setResult(null);
    setScanning(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold mb-2">Điểm danh QR</h1>
        <p className="text-muted-foreground">Quét mã QR từ giáo viên để điểm danh buổi học</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-display">Quét mã QR điểm danh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Scanner area */}
          <div className="aspect-square rounded-2xl bg-accent/50 flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
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
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Điểm danh thành công!</h3>
                <p className="text-muted-foreground mb-4">Bạn đã điểm danh buổi học Toán lớp 10A</p>
                <Badge className="bg-primary/10 text-primary">Đúng giờ</Badge>
              </div>
            ) : result === "error" ? (
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Điểm danh thất bại</h3>
                <p className="text-muted-foreground mb-4">Mã QR đã hết hạn hoặc không hợp lệ</p>
                <Button onClick={resetScan} variant="outline">Thử lại</Button>
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

          {/* Action button */}
          {!result && (
            <Button
              onClick={handleScan}
              disabled={scanning}
              className="w-full btn-primary h-12"
            >
              <Camera className="w-5 h-5 mr-2" />
              {scanning ? "Đang quét..." : "Mở camera quét QR"}
            </Button>
          )}

          {result === "success" && (
            <Button onClick={resetScan} className="w-full" variant="outline">
              Quét mã khác
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="max-w-md mx-auto">
        <CardContent className="p-4">
          <h4 className="font-semibold text-foreground mb-2">Hướng dẫn điểm danh</h4>
          <ol className="text-sm text-muted-foreground space-y-2">
            <li>1. Chờ giáo viên tạo mã QR điểm danh</li>
            <li>2. Nhấn "Mở camera quét QR" và đưa camera hướng về màn hình</li>
            <li>3. Mã QR chỉ có hiệu lực trong 5 phút</li>
            <li>4. Điểm danh sau 10 phút kể từ giờ học sẽ được tính là đi muộn</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
