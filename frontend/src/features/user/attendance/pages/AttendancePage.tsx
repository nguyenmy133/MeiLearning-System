import { useState } from "react";
import { formatDate, formatTime } from "@/lib/dateUtils";
import { ClipboardCheck, CheckCircle, XCircle, AlertCircle, Calendar, Filter, BadgeCheck, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAttendance } from "@/features/user/attendance/hooks";
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

export function AttendancePage({ compact = false }: { compact?: boolean }) {
  const [selectedClassId, setSelectedClassId] = useState("all");

  const { data: classes = [] } = useMyClasses();
  const { data: records = [], isLoading } = useMyAttendance(
    selectedClassId === "all" ? undefined : selectedClassId
  );

  // Overall stats from records
  const present = records.filter((r) => r.status === "PRESENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const absentExcused = records.filter((r) => r.status === "ABSENT_EXCUSED").length;
  const absentUnexcused = records.filter((r) => r.status === "ABSENT_UNEXCUSED").length;
  const total = records.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header — hidden in compact mode */}
      {!compact && (
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Lịch sử điểm danh
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi tình hình điểm danh và ảnh hưởng đến học phí
          </p>
        </div>
      )}

      {/* Statistics — hidden in compact mode (Dashboard already shows these) */}
      {!compact && (
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
      )}

      {/* Monthly Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Tổng kết điểm danh
          </CardTitle>
          <CardDescription>
            Số buổi theo trạng thái. Buổi nghỉ có phép không tính vào học phí.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Overall counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">{present}</p>
                <p className="text-[11px] text-green-600/80">Có mặt</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{late}</p>
                <p className="text-[11px] text-yellow-600/80">Đi muộn</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <BadgeCheck className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{absentExcused}</p>
                <p className="text-[11px] text-blue-600/80">Nghỉ CP</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-lg font-bold text-red-700 dark:text-red-400">{absentUnexcused}</p>
                <p className="text-[11px] text-red-600/80">Vắng KP</p>
              </div>
            </div>
          </div>


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
            Danh sách điểm danh theo thời gian
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
              {[...records].sort((a, b) => b.date.localeCompare(a.date)).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="font-medium text-foreground">{record.className}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(record.date)}
                        {" "}• {record.sessionTime}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={`text-xs ${getStatusBadgeClass(record.status)}`} variant="outline">
                      {ATTENDANCE_STATUS_LABELS[record.status]}
                    </Badge>

                    {record.checkedInAt && (
                      <p className="text-xs text-muted-foreground">
                        Check-in: {formatTime(record.checkedInAt)}
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
