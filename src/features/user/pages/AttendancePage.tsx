import { useState } from "react";
import { ClipboardCheck, CheckCircle, XCircle, AlertCircle, Calendar, TrendingUp, Filter, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAttendance, useAttendanceSummary } from "@/features/user/attendance/hooks";
import { useMyClasses } from "@/features/user/schedule/hooks";
import { ATTENDANCE_STATUS_LABELS, type AttendanceStatus } from "@/features/user/attendance/types";

const getStatusIcon = (status: AttendanceStatus) => {
  switch (status) {
    case "PRESENT":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "LATE":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "ABSENT_UNEXCUSED":
      return <XCircle className="h-5 w-5 text-red-500" />;
    case "ABSENT_EXCUSED":
      return <BadgeCheck className="h-5 w-5 text-blue-500" />;
  }
};

const getStatusBadgeClass = (status: AttendanceStatus) => {
  switch (status) {
    case "PRESENT": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "LATE": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "ABSENT_UNEXCUSED": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    case "ABSENT_EXCUSED": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  }
};

export function AttendancePage() {
  const [selectedClassId, setSelectedClassId] = useState("all");

  const { data: classes = [] } = useMyClasses();
  const { data: records = [], isLoading } = useMyAttendance(
    selectedClassId === "all" ? undefined : selectedClassId
  );
  const { data: summaries = [] } = useAttendanceSummary();

  // Overall stats from records
  const present = records.filter((r) => r.status === "PRESENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const absentExcused = records.filter((r) => r.status === "ABSENT_EXCUSED").length;
  const absentUnexcused = records.filter((r) => r.status === "ABSENT_UNEXCUSED").length;
  const total = records.length;
  const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Lịch sử điểm danh
        </h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi tình hình điểm danh và ảnh hưởng đến học phí
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
                <p className="text-2xl font-bold text-foreground">{total}</p>
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
                <p className="text-2xl font-bold text-foreground">{present}</p>
                <p className="text-xs text-muted-foreground">Có mặt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BadgeCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{absentExcused}</p>
                <p className="text-xs text-muted-foreground">Nghỉ có phép</p>
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
                <p className="text-2xl font-bold text-foreground">{absentUnexcused}</p>
                <p className="text-xs text-muted-foreground">Nghỉ không phép</p>
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
            Tỷ lệ có mặt (bao gồm đi muộn). Nghỉ có phép không tính vào học phí.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tỷ lệ hiện tại</span>
              <span className="text-2xl font-bold text-primary">{attendanceRate}%</span>
            </div>
          </div>

          {/* Per-class summary */}
          {summaries.length > 0 && (
            <div className="mt-4 space-y-2 pt-4 border-t">
              <p className="text-sm font-medium text-foreground mb-3">Theo từng lớp</p>
              {summaries.map((s) => (
                <div key={s.classId} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.className}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {s.present}/{s.totalSessions} buổi
                    </span>
                    <span className={`font-medium ${s.attendanceRate >= 90 ? "text-success" : "text-warning"}`}>
                      {s.attendanceRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Chọn lớp học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lớp học</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết điểm danh</CardTitle>
          <CardDescription>
            Danh sách điểm danh theo thời gian. 💡 Buổi nghỉ có phép không tính học phí.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Chưa có dữ liệu điểm danh.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="font-medium text-foreground">{record.className}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.date).toLocaleDateString("vi-VN", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                        {" "}• {record.sessionTime}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={`text-xs ${getStatusBadgeClass(record.status)}`} variant="outline">
                      {ATTENDANCE_STATUS_LABELS[record.status]}
                    </Badge>
                    <p className={`text-xs ${record.isBillable ? "text-warning" : "text-blue-500"}`}>
                      {record.isBillable ? "💰 Tính phí" : "✅ Miễn phí"}
                    </p>
                    {record.checkedInAt && (
                      <p className="text-xs text-muted-foreground">
                        Check-in: {new Date(record.checkedInAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
