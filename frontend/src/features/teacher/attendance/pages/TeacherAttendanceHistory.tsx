import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, CheckCircle, Clock, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeacherSessions, useSessionAttendance } from "../hooks";
import { ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_COLORS } from "../types";
import type { AttendeeRecord } from "../types";

export function TeacherAttendanceHistory() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState(0);

  // Fetch all completed sessions (no date filter → get all)
  const { data: allSessions = [], isLoading: sessionsLoading } = useTeacherSessions();
  const completedSessions = allSessions.filter((s) => s.status === "completed");

  // Group sessions by date
  const sessionDates = [...new Set(completedSessions.map((s) => s.date))].sort().reverse();

  // Get sessions for selected date
  const filteredSessions = selectedDate
    ? completedSessions.filter((s) => s.date === selectedDate)
    : completedSessions;

  // Fetch roster for selected session
  const { data: roster = [], isLoading: rosterLoading } = useSessionAttendance(selectedSessionId);

  const selectedSession = completedSessions.find((s) => s.id === selectedSessionId);

  // Stats
  const present = roster.filter((a) => a.status === "present").length;
  const late = roster.filter((a) => a.status === "late").length;
  const absent = roster.filter((a) => a.status === "absent").length;
  const absentExcused = roster.filter((a) => a.status === "absent_excused").length;
  const total = roster.length;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedDate} onValueChange={(v) => { setSelectedDate(v === "all" ? "" : v); setSelectedSessionId(0); }}>
          <SelectTrigger className="sm:w-[200px]">
            <SelectValue placeholder="Tất cả ngày" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả ngày</SelectItem>
            {sessionDates.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Session list */}
      {sessionsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Chưa có buổi học nào đã chốt điểm danh.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSessions.map((s) => (
            <Card
              key={s.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedSessionId === s.id ? "ring-2 ring-primary border-primary" : ""
              }`}
              onClick={() => setSelectedSessionId(s.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground">{s.className}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {s.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {s.startTime}–{s.endTime}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.room}</p>
                  </div>
                  <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-50">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Đã chốt
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Roster detail */}
      {selectedSessionId > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Chi tiết điểm danh — {selectedSession?.className}
            </CardTitle>
            <CardDescription>
              {selectedSession?.date} · {selectedSession?.startTime}–{selectedSession?.endTime}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Stats ribbon */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">{total}</p>
                <p className="text-[10px] text-muted-foreground">Tổng</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-lg font-bold text-green-600">{present}</p>
                <p className="text-[10px] text-green-600/70">Có mặt</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-lg font-bold text-yellow-600">{late}</p>
                <p className="text-[10px] text-yellow-600/70">Muộn</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-lg font-bold text-blue-600">{absentExcused}</p>
                <p className="text-[10px] text-blue-600/70">Nghỉ CP</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-lg font-bold text-red-600">{absent}</p>
                <p className="text-[10px] text-red-600/70">Vắng</p>
              </div>
            </div>

            {/* Student list */}
            {rosterLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {roster.map((student: AttendeeRecord) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{student.name}</p>
                        {student.checkinTime && (
                          <p className="text-[11px] text-muted-foreground">
                            Check-in: {student.checkinTime} · {student.method === "qr" ? "QR" : "Thủ công"}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${ATTENDANCE_STATUS_COLORS[student.status] ?? ""}`}
                    >
                      {ATTENDANCE_STATUS_LABELS[student.status] ?? student.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Rate */}
            {total > 0 && (
              <div className="mt-4 pt-3 border-t flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tỷ lệ có mặt</span>
                <span className={`font-bold ${rate >= 80 ? "text-green-600" : rate >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                  {rate}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
