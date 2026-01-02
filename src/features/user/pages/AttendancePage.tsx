import { useState } from "react";
import { ClipboardCheck, CheckCircle, XCircle, AlertCircle, Calendar, TrendingUp, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const attendanceRecords = [
  { id: 1, date: "16/12/2024", day: "Thứ hai", class: "Tiếng Anh Giao tiếp", time: "08:00", status: "present", checkInTime: "07:55" },
  { id: 2, date: "16/12/2024", day: "Thứ hai", class: "IELTS Speaking", time: "10:00", status: "present", checkInTime: "09:58" },
  { id: 3, date: "14/12/2024", day: "Thứ bảy", class: "IELTS Practice", time: "09:00", status: "present", checkInTime: "08:50" },
  { id: 4, date: "13/12/2024", day: "Thứ sáu", class: "Business English", time: "14:00", status: "late", checkInTime: "14:20" },
  { id: 5, date: "13/12/2024", day: "Thứ sáu", class: "Tiếng Anh Giao tiếp", time: "16:00", status: "present", checkInTime: "15:55" },
  { id: 6, date: "12/12/2024", day: "Thứ năm", class: "IELTS Speaking", time: "10:00", status: "absent", checkInTime: null },
  { id: 7, date: "11/12/2024", day: "Thứ tư", class: "Tiếng Anh Giao tiếp", time: "08:00", status: "present", checkInTime: "07:50" },
  { id: 8, date: "11/12/2024", day: "Thứ tư", class: "IELTS Writing", time: "10:00", status: "present", checkInTime: "09:55" },
  { id: 9, date: "10/12/2024", day: "Thứ ba", class: "Business English", time: "14:00", status: "present", checkInTime: "13:58" },
  { id: 10, date: "09/12/2024", day: "Thứ hai", class: "Tiếng Anh Giao tiếp", time: "08:00", status: "late", checkInTime: "08:18" },
];

const courses = [
  { id: "all", name: "Tất cả khóa học" },
  { id: "english", name: "Tiếng Anh Giao tiếp" },
  { id: "ielts-speaking", name: "IELTS Speaking" },
  { id: "ielts-writing", name: "IELTS Writing" },
  { id: "business", name: "Business English" },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "present":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "late":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "absent":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return null;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "present":
      return "Có mặt";
    case "late":
      return "Đi muộn";
    case "absent":
      return "Vắng mặt";
    default:
      return "";
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "present":
      return "default";
    case "late":
      return "secondary";
    case "absent":
      return "destructive";
    default:
      return "outline";
  }
};

export function AttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("12");

  // Calculate statistics
  const totalClasses = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.status === "present").length;
  const lateCount = attendanceRecords.filter(r => r.status === "late").length;
  const absentCount = attendanceRecords.filter(r => r.status === "absent").length;
  const attendanceRate = Math.round(((presentCount + lateCount) / totalClasses) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Lịch sử điểm danh
        </h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi tình hình điểm danh của bạn
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalClasses}</p>
                <p className="text-xs text-muted-foreground">Tổng số buổi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{presentCount}</p>
                <p className="text-xs text-muted-foreground">Có mặt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{lateCount}</p>
                <p className="text-xs text-muted-foreground">Đi muộn</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{absentCount}</p>
                <p className="text-xs text-muted-foreground">Vắng mặt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tỷ lệ điểm danh
          </CardTitle>
          <CardDescription>
            Tỷ lệ có mặt (bao gồm đi muộn) trong tháng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tiến độ</span>
              <span className="text-2xl font-bold text-primary">{attendanceRate}%</span>
            </div>
            <Progress value={attendanceRate} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mục tiêu: 90%</span>
              <span className={attendanceRate >= 90 ? "text-success" : "text-warning"}>
                {attendanceRate >= 90 ? "Đạt mục tiêu ✓" : `Còn ${90 - attendanceRate}% nữa`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Chọn khóa học" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">Tháng 12/2024</SelectItem>
                  <SelectItem value="11">Tháng 11/2024</SelectItem>
                  <SelectItem value="10">Tháng 10/2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết điểm danh</CardTitle>
          <CardDescription>
            Danh sách điểm danh theo thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium text-foreground">{record.class}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.day}, {record.date} • {record.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusBadgeVariant(record.status) as any}>
                    {getStatusText(record.status)}
                  </Badge>
                  {record.checkInTime && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Check-in: {record.checkInTime}
                    </p>
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
