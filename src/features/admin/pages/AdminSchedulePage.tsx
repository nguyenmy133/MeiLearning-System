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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  BookOpen,
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

export function AdminSchedulePage() {
  const [selectedFacility, setSelectedFacility] = useState("Tất cả cơ sở");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm buổi học
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm buổi học mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Lớp học</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lớp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="toan10a">Toán 10A</SelectItem>
                        <SelectItem value="anhvanb1">Anh Văn B1</SelectItem>
                        <SelectItem value="hoa11">Hóa 11</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ngày</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Giờ bắt đầu</Label>
                      <Input type="time" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                    Thêm buổi học
                  </Button>
                </div>
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
