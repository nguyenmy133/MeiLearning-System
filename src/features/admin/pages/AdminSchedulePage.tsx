import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  BookOpen,
  RefreshCw,
  Sparkles,
  CreditCard,
  Info,
} from "lucide-react";

// Mock schedule data
const weekSchedule = [
  {
    day: "Thứ 2",
    date: "16/12",
    sessions: [
      { id: 1, time: "08:00 - 10:00", class: "Văn 12", teacher: "Phạm Minh Tuấn", room: "Phòng 201", facility: "Q1", students: 22, status: "completed" },
      { id: 2, time: "14:00 - 16:00", class: "Toán 10A", teacher: "Nguyễn Thị Mai", room: "Phòng 101", facility: "Q1", students: 18, status: "upcoming" },
      { id: 3, time: "18:00 - 20:00", class: "Toán 10A", teacher: "Nguyễn Thị Mai", room: "Phòng 101", facility: "Q1", students: 18, status: "upcoming" },
    ],
  },
  {
    day: "Thứ 3",
    date: "17/12",
    sessions: [
      { id: 4, time: "19:00 - 21:00", class: "Anh Văn B1", teacher: "Trần Văn Hùng", room: "Phòng A1", facility: "Q3", students: 15, status: "upcoming" },
    ],
  },
  {
    day: "Thứ 4",
    date: "18/12",
    sessions: [
      { id: 5, time: "08:00 - 10:00", class: "Văn 12", teacher: "Phạm Minh Tuấn", room: "Phòng 201", facility: "Q1", students: 22, status: "upcoming" },
      { id: 6, time: "18:00 - 20:00", class: "Toán 10A", teacher: "Nguyễn Thị Mai", room: "Phòng 101", facility: "Q1", students: 18, status: "upcoming" },
    ],
  },
  {
    day: "Thứ 5",
    date: "19/12",
    sessions: [
      { id: 7, time: "19:00 - 21:00", class: "Anh Văn B1", teacher: "Trần Văn Hùng", room: "Phòng A1", facility: "Q3", students: 15, status: "upcoming" },
    ],
  },
  {
    day: "Thứ 6",
    date: "20/12",
    sessions: [
      { id: 8, time: "08:00 - 10:00", class: "Văn 12", teacher: "Phạm Minh Tuấn", room: "Phòng 201", facility: "Q1", students: 22, status: "upcoming" },
      { id: 9, time: "18:00 - 20:00", class: "Toán 10A", teacher: "Nguyễn Thị Mai", room: "Phòng 101", facility: "Q1", students: 18, status: "upcoming" },
    ],
  },
  {
    day: "Thứ 7",
    date: "21/12",
    sessions: [
      { id: 10, time: "08:00 - 10:00", class: "Hóa 11", teacher: "Lê Thị Hương", room: "Phòng Lab 1", facility: "TĐ", students: 12, status: "upcoming" },
    ],
  },
  {
    day: "Chủ nhật",
    date: "22/12",
    sessions: [
      { id: 11, time: "08:00 - 10:00", class: "Hóa 11", teacher: "Lê Thị Hương", room: "Phòng Lab 1", facility: "TĐ", students: 12, status: "upcoming" },
    ],
  },
];

const facilities = ["Tất cả cơ sở", "Cơ sở Quận 1", "Cơ sở Quận 3", "Cơ sở Thủ Đức"];

// Mock classes — trong thực tế sẽ lấy từ API
const activeClasses = [
  { id: "toan10a", name: "Toán 10A", teacher: "Nguyễn Thị Mai", defaultStart: "18:00", defaultEnd: "20:00" },
  { id: "anhvanb1", name: "Anh Văn B1", teacher: "Trần Văn Hùng", defaultStart: "19:00", defaultEnd: "21:00" },
  { id: "hoa11", name: "Hóa 11", teacher: "Lê Thị Hương", defaultStart: "08:00", defaultEnd: "10:00" },
  { id: "van12", name: "Văn 12 - Luyện thi", teacher: "Phạm Minh Tuấn", defaultStart: "08:00", defaultEnd: "10:00" },
  { id: "ly10a", name: "Lý 10A", teacher: "Nguyễn Thị Mai", defaultStart: "18:00", defaultEnd: "20:00" },
];

export function AdminSchedulePage() {
  const [selectedFacility, setSelectedFacility] = useState("Tất cả cơ sở");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State form Thêm buổi học
  const [sessionType, setSessionType] = useState<"makeup" | "extra">("makeup");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [sessionTeacher, setSessionTeacher] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionStart, setSessionStart] = useState("");
  const [sessionEnd, setSessionEnd] = useState("");
  const [sessionNote, setSessionNote] = useState("");

  // Khi chọn lớp → tự điền GV và giờ mặc định từ lớp đó
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const found = activeClasses.find((c) => c.id === classId);
    if (found) {
      setSessionTeacher(found.teacher);
      setSessionStart(found.defaultStart);
      setSessionEnd(found.defaultEnd);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSessionType("makeup");
      setSelectedClassId("");
      setSessionTeacher("");
      setSessionDate("");
      setSessionStart("");
      setSessionEnd("");
      setSessionNote("");
    }
  };

  const totalSessions = weekSchedule.reduce((acc, day) => acc + day.sessions.length, 0);
  const completedSessions = weekSchedule.reduce(
    (acc, day) => acc + day.sessions.filter((s) => s.status === "completed").length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalSessions}</p>
                <p className="text-sm text-muted-foreground">Buổi học tuần này</p>
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
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-sm text-muted-foreground">Lớp đang dạy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedSessions}</p>
                <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">4</p>
                <p className="text-sm text-muted-foreground">Giáo viên</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-4">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg font-display">Lịch học tuần</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">16 - 22/12/2024</span>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedFacility} onValueChange={setSelectedFacility}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm buổi học
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Thêm buổi học</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2 max-h-[80vh] overflow-y-auto pr-1">

                  {/* ─ Loại buổi học — ảnh hưởng trực tiếp đến học phí ─ */}
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Loại buổi
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSessionType("makeup")}
                      className={`flex flex-col items-start p-3 rounded-lg border text-left transition-colors ${
                        sessionType === "makeup"
                          ? "bg-primary/5 border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <RefreshCw className={`w-4 h-4 ${sessionType === "makeup" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-semibold ${sessionType === "makeup" ? "text-primary" : "text-foreground"}`}>
                          Buổi học bù
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Bù cho buổi đã nghỉ. Không tính thêm phí.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionType("extra")}
                      className={`flex flex-col items-start p-3 rounded-lg border text-left transition-colors ${
                        sessionType === "extra"
                          ? "bg-primary/5 border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className={`w-4 h-4 ${sessionType === "extra" ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-semibold ${sessionType === "extra" ? "text-primary" : "text-foreground"}`}>
                          Buổi học thêm
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Ngoài lịch thường. Tính thêm vào hóa đơn.</p>
                    </button>
                  </div>

                  {/* Billing notice */}
                  <div className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${
                    sessionType === "makeup"
                      ? "bg-muted border-border"
                      : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                  }`}>
                    <CreditCard className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      sessionType === "makeup" ? "text-muted-foreground" : "text-amber-600"
                    }`} />
                    <p className={sessionType === "makeup" ? "text-muted-foreground" : "text-amber-700 dark:text-amber-400"}>
                      {sessionType === "makeup"
                        ? "Buổi bù không được tính thêm vào hóa đơn tháng."
                        : "Buổi thêm sẽ được cộng vào hóa đơn cuối tháng của học viên."}
                    </p>
                  </div>

                  {/* ─ Thông tin buổi học ─ */}
                  <Separator />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Thông tin buổi học
                  </p>

                  <div className="space-y-2">
                    <Label>Lớp học <span className="text-destructive">*</span></Label>
                    <Select value={selectedClassId} onValueChange={handleClassChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lớp" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeClasses.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Giáo viên — tự điền từ lớp, nhưng có thể đổi (GV dạy thế) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Giáo viên <span className="text-destructive">*</span></Label>
                      {sessionTeacher && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Tự điền từ lớp — có thể đổi nếu dạy thế
                        </span>
                      )}
                    </div>
                    <Select value={sessionTeacher} onValueChange={setSessionTeacher}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giáo viên" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nguyễn Thị Mai">Nguyễn Thị Mai</SelectItem>
                        <SelectItem value="Trần Văn Hùng">Trần Văn Hùng</SelectItem>
                        <SelectItem value="Lê Thị Hương">Lê Thị Hương</SelectItem>
                        <SelectItem value="Phạm Minh Tuấn">Phạm Minh Tuấn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ─ Thời gian ─ */}
                  <div className="space-y-2">
                    <Label>Ngày học <span className="text-destructive">*</span></Label>
                    <Input
                      type="date"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Khung giờ <span className="text-destructive">*</span></Label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        type="time"
                        value={sessionStart}
                        onChange={(e) => setSessionStart(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-muted-foreground text-sm">→</span>
                      <Input
                        type="time"
                        value={sessionEnd}
                        onChange={(e) => setSessionEnd(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Giờ được tự điền từ lịch lớp, có thể điều chỉnh nếu cần.
                    </p>
                  </div>

                  {/* ─ Địa điểm ─ */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Cơ sở</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn cơ sở" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="q1">Cơ sở Quận 1</SelectItem>
                          <SelectItem value="q3">Cơ sở Quận 3</SelectItem>
                          <SelectItem value="td">Cơ sở Thủ Đức</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Phòng</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phòng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="101">Phòng 101</SelectItem>
                          <SelectItem value="102">Phòng 102</SelectItem>
                          <SelectItem value="201">Phòng 201</SelectItem>
                          <SelectItem value="a1">Phòng A1</SelectItem>
                          <SelectItem value="lab1">Phòng Lab 1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* ─ Ghi chú ─ */}
                  <div className="space-y-2">
                    <Label>
                      {sessionType === "makeup" ? "Lý do buổi bù" : "Ghi chú"}
                    </Label>
                    <Textarea
                      placeholder={
                        sessionType === "makeup"
                          ? "VD: Bù buổi T4 ngày 20/12 do nghỉ lễ..."
                          : "VD: Buổi ôn thi cuối kỳ..."
                      }
                      value={sessionNote}
                      onChange={(e) => setSessionNote(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => handleDialogClose(false)}>Hủy</Button>
                  <Button
                    disabled={!selectedClassId || !sessionDate || !sessionStart || !sessionEnd}
                    onClick={() => handleDialogClose(false)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm buổi học
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week Grid */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekSchedule.map((day) => (
              <div key={day.day} className="space-y-2">
                <div className="text-center pb-2 border-b border-border">
                  <p className="font-medium text-foreground">{day.day}</p>
                  <p className="text-sm text-muted-foreground">{day.date}</p>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {day.sessions.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Không có lịch</p>
                  ) : (
                    day.sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-2 rounded-lg border text-xs space-y-1 cursor-pointer hover:shadow-md transition-shadow ${
                          session.status === "completed"
                            ? "bg-muted/50 border-muted"
                            : "bg-primary/5 border-primary/20"
                        }`}
                      >
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{session.time}</span>
                        </div>
                        <p className="font-medium text-foreground truncate">{session.class}</p>
                        <p className="text-muted-foreground truncate">{session.teacher}</p>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{session.room}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{session.students}</span>
                          </div>
                          <Badge
                            className={`text-[10px] px-1 py-0 ${
                              session.status === "completed"
                                ? "bg-muted text-muted-foreground"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {session.facility}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
