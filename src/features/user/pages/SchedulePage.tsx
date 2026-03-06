import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMySchedule } from "@/features/user/schedule/hooks";

const getWeekDates = (offset: number) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
};

const toISO = (date: Date) => date.toISOString().split("T")[0];

export function SchedulePage({ onCheckIn }: { onCheckIn?: (subject: string, sessionId: string) => void }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = getWeekDates(weekOffset);
  const today = new Date();
  const todayStr = toISO(today);

  const startDate = toISO(weekDates[0]);
  const endDate = toISO(weekDates[6]);

  const { data: sessions = [], isLoading } = useMySchedule(startDate, endDate);

  const isToday = (date: Date) => date.toDateString() === today.toDateString();

  const formatDateRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
  };

  // Group sessions by date
  const sessionsByDate = (date: Date) => {
    const dateStr = toISO(date);
    return sessions.filter((s) => s.date === dateStr);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Week Paginator */}
        <div className="flex items-center gap-4 bg-background border border-border rounded-lg p-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((prev) => prev - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center min-w-[140px]">
            <p className="text-sm font-medium text-foreground">{formatDateRange()}</p>
            <p className="text-xs text-muted-foreground">
              {weekOffset === 0 ? "Tuần này" : weekOffset > 0 ? `${weekOffset} tuần sau` : `${Math.abs(weekOffset)} tuần trước`}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((prev) => prev + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {weekOffset !== 0 && (
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
            Về tuần này
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 pb-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 pb-4">
          {weekDates.map((date, index) => {
            const currentDay = isToday(date);
            const daySessions = sessionsByDate(date);
            const dayOfWeek = date.getDay(); // 0 = Sunday

            return (
              <div
                key={index}
                className={`min-w-0 border rounded-2xl p-4 flex flex-col gap-4 bg-card ${
                  currentDay ? "border-primary shadow-sm" : "border-border"
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center flex-wrap gap-2">
                  <span className={`font-semibold ${currentDay ? "text-primary" : "text-foreground"}`}>
                    {dayOfWeek === 0 ? "CN" : `Thứ ${dayOfWeek + 1}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {date.getDate()}/{date.getMonth() + 1}
                  </span>
                  {currentDay && (
                    <Badge variant="default" className="bg-primary text-primary-foreground hover:bg-primary border-none whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider">
                      Hôm nay
                    </Badge>
                  )}
                </div>

                {/* Column Classes */}
                <div className="flex-1 flex flex-col gap-3">
                  {daySessions.length > 0 ? (
                    daySessions.map((sess) => {
                      const isPast = sess.date < todayStr || sess.status === "completed";
                      return (
                        <div
                          key={sess.id}
                          className={`p-3 rounded-xl border-l-[3px] flex flex-col gap-2 ${
                            sess.attendanceStatus === "ABSENT_EXCUSED"
                              ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-400"
                              : isPast
                              ? "bg-muted/30 border-muted-foreground/30"
                              : "bg-primary/10 border-primary"
                          }`}
                        >
                          <h4 className="font-semibold text-foreground text-sm">{sess.className}</h4>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{sess.startTime} - {sess.endTime}</span>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{sess.room}</span>
                          </div>

                          {/* Attendance status badge for past sessions */}
                          {sess.attendanceStatus && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] w-fit ${
                                sess.attendanceStatus === "PRESENT" ? "text-green-600 border-green-300" :
                                sess.attendanceStatus === "ABSENT_EXCUSED" ? "text-blue-600 border-blue-300" :
                                sess.attendanceStatus === "LATE" ? "text-yellow-600 border-yellow-300" :
                                "text-red-600 border-red-300"
                              }`}
                            >
                              {sess.attendanceStatus === "PRESENT" ? "Đã có mặt" :
                               sess.attendanceStatus === "ABSENT_EXCUSED" ? "Nghỉ có phép" :
                               sess.attendanceStatus === "LATE" ? "Đi muộn" :
                               "Vắng không phép"}
                            </Badge>
                          )}

                          {/* Check-in button only for today's sessions */}
                          {sess.canCheckIn && !sess.attendanceStatus && (
                            <Button
                              size="sm"
                              variant="default"
                              className="w-full mt-1.5 h-8 text-xs font-medium"
                              onClick={() => onCheckIn?.(sess.className, sess.id)}
                            >
                              Điểm danh QR
                            </Button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground py-6 text-center">
                      Không có lớp
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
