import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useClasses } from "@/features/admin/classes/hooks";
import {
  QrCode,
  RefreshCw,
  StopCircle,
  CheckCircle,
  Clock,
  Users,
  UserX,
  UserCheck,
  Save,
  Maximize2
} from "lucide-react";

// MOCK: current logged-in teacher ID — swap for auth context when BE is ready
const CURRENT_TEACHER_ID = 1;

// Mock initial data
const initialStudents = [
  { id: 1, name: "Nguyễn Văn A", status: "present", time: "14:02" },
  { id: 2, name: "Trần Thị B", status: "present", time: "14:03" },
  { id: 3, name: "Lê Văn C", status: "late", time: "14:12" },
  { id: 4, name: "Phạm Thị D", status: "pending", time: null },
  { id: 5, name: "Hoàng Văn E", status: "pending", time: null },
  { id: 6, name: "Vũ Thị F", status: "pending", time: null },
];

export function TeacherAttendancePage() {
  const { toast } = useToast();
  const [qrActive, setQrActive] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [students, setStudents] = useState(initialStudents);

  // Fetch teacher's classes from admin service
  const { data: classPage } = useClasses({ teacherId: CURRENT_TEACHER_ID, limit: 50 });
  const myClasses = classPage?.data ?? [];

  // Handle countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (qrActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && qrActive) {
      setQrActive(false);
      setCountdown(300);
      toast({
        title: "Mã QR đã hết hạn",
        description: "Học sinh không thể quét mã này nữa.",
        variant: "destructive",
      });
    }
    return () => clearInterval(timer);
  }, [qrActive, countdown, toast]);

  const handleGenerateQR = () => {
    setQrActive(true);
    setCountdown(300);
  };

  const handleStopQR = () => {
    setQrActive(false);
    setCountdown(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Status updates
  const updateStudentStatus = (id: number, newStatus: string) => {
    setStudents(students.map(s => {
      if (s.id === id) {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        return {
          ...s,
          status: newStatus,
          time: newStatus === "absent" ? null : timeStr
        };
      }
      return s;
    }));
  };

  const handleSaveAttendance = () => {
    // Auto-mark pending as absent
    const updated = students.map(s => s.status === "pending" ? { ...s, status: "absent" } : s);
    setStudents(updated);
    
    // Stop QR if running
    if (qrActive) handleStopQR();

    toast({
      title: "Đã chốt điểm danh",
      description: `Ghi nhận ${updated.filter(s => s.status === 'present' || s.status === 'late').length}/${updated.length} học viên có mặt.`,
    });
  };

  // Stats calculation
  const total = students.length;
  const present = students.filter(s => s.status === "present").length;
  const late = students.filter(s => s.status === "late").length;
  const absent = students.filter(s => s.status === "absent").length;
  const pending = students.filter(s => s.status === "pending").length;
  
  const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">Điểm danh buổi học</h1>
          <p className="text-muted-foreground">Tạo mã QR hoặc điểm danh thủ công cho học viên</p>
        </div>
        <Button onClick={handleSaveAttendance} className="btn-primary">
          <Save className="w-4 h-4 mr-2" />
          Chốt điểm danh
        </Button>
      </div>

      <div className="grid xl:grid-cols-[1fr_2fr] gap-6">
        
        {/* LÈFT COLUMN: QR Generation & Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                Kiểm soát mã QR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Chọn lớp đang dạy</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Chọn lớp --" />
                    </SelectTrigger>
                    <SelectContent>
                      {myClasses.map((cls) => (
                        <SelectItem key={cls.id} value={String(cls.id)}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* QR Display Area */}
              <div className="relative pt-2">
                <div className={`aspect-square w-full max-w-[260px] mx-auto rounded-2xl flex flex-col items-center justify-center p-6 transition-all duration-300 ${
                  qrActive 
                    ? countdown < 60 ? "bg-red-50 border-2 border-red-200" : "bg-primary/5 border-2 border-primary/20" 
                    : "bg-accent border-2 border-dashed border-border"
                }`}>
                  
                  {qrActive ? (
                    <>
                      <div className="absolute top-3 right-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm p-4">
                        <QrCode className="w-full h-full text-zinc-900" strokeWidth={1.5} />
                      </div>
                      <div className={`flex items-center justify-center gap-2 text-2xl font-bold tracking-tight font-mono ${
                        countdown < 60 ? "text-red-500 animate-pulse" : "text-primary"
                      }`}>
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
                        Chọn Lớp đang dạy, sau đó tạo mã để học viên bắt đầu quét.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Action Buttons */}
              <div className="flex gap-3 pt-2">
                {qrActive ? (
                  <>
                    <Button onClick={handleStopQR} variant="destructive" className="flex-1 bg-red-500 hover:bg-red-600">
                      <StopCircle className="w-4 h-4 mr-2" />
                      Đóng QR
                    </Button>
                    <Button onClick={handleGenerateQR} variant="outline" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Tạo lại
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleGenerateQR}
                    className="w-full btn-primary h-12 text-base"
                    disabled={!selectedClass}
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    Hiển thị mã QR
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Real-time Stats & Manual Attendance List */}
        <div className="space-y-6">
          
          {/* Stats Bar */}
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
            <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 shadow-sm flex flex-col justify-center">
              <span className="text-sm text-secondary-foreground font-medium mb-1">Đi muộn</span>
              <div className="flex items-end gap-2 text-2xl font-bold text-secondary-foreground">
                {late} <Clock className="w-5 h-5 mb-1 opacity-70" />
              </div>
            </div>
            <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-4 shadow-sm flex flex-col justify-center">
              <span className="text-sm text-destructive font-medium mb-1">Vắng / Chưa tới</span>
              <div className="flex items-end gap-2 text-2xl font-bold text-destructive">
                {absent + pending} <UserX className="w-5 h-5 mb-1 opacity-70" />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border/50 bg-accent/30">
              <span className="text-sm font-medium">Tiến độ điểm danh buổi học</span>
              <span className="text-sm font-bold text-primary">{attendanceRate}%</span>
            </div>
            <Progress value={attendanceRate} className="h-2 rounded-none" />
          </Card>

          {/* Interactive Student List */}
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
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-colors ${
                      student.status === "present" ? "bg-primary/5 border-primary/20" :
                      student.status === "late" ? "bg-secondary/10 border-secondary/30" :
                      student.status === "absent" ? "bg-destructive/5 border-destructive/20" :
                      "bg-card border-border/50 hover:bg-accent/50"
                    }`}
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-3 mb-3 sm:mb-0">
                      <div className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center ${
                        student.status === "present" ? "bg-primary text-primary-foreground" :
                        student.status === "late" ? "bg-secondary text-secondary-foreground" :
                        student.status === "absent" ? "bg-destructive text-destructive-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {student.status === "present" ? <CheckCircle className="w-5 h-5" /> :
                         student.status === "late" ? <Clock className="w-5 h-5" /> :
                         student.status === "absent" ? <UserX className="w-5 h-5" /> :
                         <Users className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground text-[15px]">{student.name}</span>
                        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                          {student.time ? (
                            <>
                              <Clock className="w-3 h-3 mr-1" /> Lúc {student.time} 
                              {student.status === 'present' ? ' (QR)' : ' (Ghi tay)'}
                            </>
                          ) : (
                            "Chưa có thông tin"
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Manual Override Actions */}
                    <div className="flex items-center gap-1.5 sm:pl-4 sm:border-l border-border/50">
                      <Button
                        size="sm"
                        variant={student.status === "present" ? "default" : "outline"}
                        className={`h-8 px-2.5 text-xs ${student.status === "present" ? "bg-primary text-white" : ""}`}
                        onClick={() => updateStudentStatus(student.id, "present")}
                      >
                        Có mặt
                      </Button>
                      <Button
                        size="sm"
                        variant={student.status === "late" ? "secondary" : "outline"}
                        className={`h-8 px-2.5 text-xs ${student.status === "late" ? "border-transparent" : ""}`}
                        onClick={() => updateStudentStatus(student.id, "late")}
                      >
                        Đi muộn
                      </Button>
                      <Button
                        size="sm"
                        variant={student.status === "absent" ? "destructive" : "outline"}
                        className={`h-8 px-2.5 text-xs ${student.status === "absent" ? "" : "text-destructive hover:bg-destructive/10"}`}
                        onClick={() => updateStudentStatus(student.id, "absent")}
                      >
                        Vắng
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
