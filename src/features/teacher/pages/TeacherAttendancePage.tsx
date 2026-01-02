import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, RefreshCw, StopCircle, CheckCircle, Clock, Users } from "lucide-react";

const students = [
  { id: 1, name: "Nguyễn Văn A", status: "present", time: "14:02" },
  { id: 2, name: "Trần Thị B", status: "present", time: "14:03" },
  { id: 3, name: "Lê Văn C", status: "late", time: "14:12" },
  { id: 4, name: "Phạm Thị D", status: "pending", time: null },
];

export function TeacherAttendancePage() {
  const [qrActive, setQrActive] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [countdown, setCountdown] = useState(300);

  const handleGenerateQR = () => {
    setQrActive(true);
    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setQrActive(false);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold mb-2">Điểm danh buổi học</h1>
        <p className="text-muted-foreground">Tạo mã QR để học viên điểm danh</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Tạo QR điểm danh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Chọn lớp</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10a">Toán 10A</SelectItem>
                    <SelectItem value="12b">Toán 12B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Chọn buổi</label>
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Chọn buổi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Buổi 1 - 14:00</SelectItem>
                    <SelectItem value="2">Buổi 2 - 16:30</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* QR Display */}
            <div className="aspect-square max-w-[280px] mx-auto rounded-2xl bg-accent flex items-center justify-center border-2 border-dashed border-border">
              {qrActive ? (
                <div className="text-center p-4">
                  <div className="w-48 h-48 bg-foreground rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="w-32 h-32 text-background" />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-lg font-semibold text-primary">
                    <Clock className="w-5 h-5" />
                    {formatTime(countdown)}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Nhấn nút bên dưới để tạo QR</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {qrActive ? (
                <>
                  <Button
                    onClick={() => { setQrActive(false); setCountdown(300); }}
                    variant="outline"
                    className="flex-1"
                  >
                    <StopCircle className="w-4 h-4 mr-2" />
                    Dừng
                  </Button>
                  <Button
                    onClick={() => setCountdown(300)}
                    className="flex-1 btn-primary"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tạo mới
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleGenerateQR}
                  className="w-full btn-primary h-12"
                  disabled={!selectedClass || !selectedSession}
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Tạo QR điểm danh
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">Danh sách điểm danh</CardTitle>
            <Badge variant="secondary">
              <Users className="w-3 h-3 mr-1" />
              {students.filter(s => s.status !== "pending").length}/{students.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      student.status === "present" ? "bg-primary/10" :
                      student.status === "late" ? "bg-secondary" :
                      "bg-muted"
                    }`}>
                      {student.status === "present" || student.status === "late" ? (
                        <CheckCircle className={`w-4 h-4 ${
                          student.status === "present" ? "text-primary" : "text-secondary-foreground"
                        }`} />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-medium text-foreground">{student.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.time && (
                      <span className="text-sm text-muted-foreground">{student.time}</span>
                    )}
                    <Badge
                      variant={
                        student.status === "present" ? "default" :
                        student.status === "late" ? "secondary" :
                        "outline"
                      }
                      className={student.status === "present" ? "bg-primary" : ""}
                    >
                      {student.status === "present" ? "Có mặt" :
                       student.status === "late" ? "Muộn" : "Chờ"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
