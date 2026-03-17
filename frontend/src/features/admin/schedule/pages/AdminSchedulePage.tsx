import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  useWeekSessions,
  useScheduleStats,
  useClassRefs,
  useAddSession,
} from "../hooks";
import { checkConflict } from "../services";
import type { ScheduledSession, AddSessionDTO } from "../types";
import {
  DAY_LABELS,
} from "../types";
import { useTeacherOptions, useFacilityOptions, useRoomsByFacility } from "@/hooks/useClassOptions";

// Get current Monday as default week start
function getCurrentMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split("T")[0];
}

// ── Date helpers ──────────────────────────────────────────────────────────────
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return DAY_LABELS[d.getDay()];
}

interface WeekDay {
  date: string;
  dayLabel: string;
  dateLabel: string;
}

function buildWeekDays(mondayStr: string): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(mondayStr, i);
    return { date, dayLabel: getDayLabel(date), dateLabel: formatDateLabel(date) };
  });
}

function buildWeekLabel(mondayStr: string): string {
  const start = new Date(mondayStr);
  const end = new Date(mondayStr);
  end.setDate(end.getDate() + 6);
  const month = String(end.getMonth() + 1).padStart(2, "0");
  return `${start.getDate()} - ${end.getDate()}/${month}/${end.getFullYear()}`;
}

// ── Session card ──────────────────────────────────────────────────────────────
function SessionCard({ session }: { session: ScheduledSession }) {
  return (
    <div
      className={`p-2 rounded-lg border text-xs space-y-1 cursor-pointer hover:shadow-md transition-shadow ${
        session.status === "completed"
          ? "bg-muted/50 border-muted"
          : "bg-primary/5 border-primary/20"
      }`}
    >
      <div className="flex items-center gap-1 text-muted-foreground">
        <Clock className="w-3 h-3 flex-shrink-0" />
        <span>{session.startTime} - {session.endTime}</span>
        {session.type !== "regular" && (
          <Badge
            className={`ml-auto text-[9px] px-1 py-0 ${
              session.type === "makeup"
                ? "bg-blue-100 text-blue-700 border-0"
                : "bg-amber-100 text-amber-700 border-0"
            }`}
          >
            {session.type === "makeup" ? "Bù" : "Thêm"}
          </Badge>
        )}
      </div>
      <p className="font-medium text-foreground truncate">{session.className}</p>
      <p className="text-muted-foreground truncate">{session.teacherName}</p>
      <div className="flex items-center gap-1 text-muted-foreground">
        <MapPin className="w-3 h-3 flex-shrink-0" />
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
              ? "bg-muted text-muted-foreground border-0"
              : "bg-primary/10 text-primary border-0"
          }`}
        >
          {session.facilityShort}
        </Badge>
      </div>
    </div>
  );
}

// ── Day column skeleton ───────────────────────────────────────────────────────
function DaySkeleton() {
  return (
    <div className="space-y-2">
      <div className="text-center pb-2 border-b border-border">
        <Skeleton className="h-4 w-12 mx-auto mb-1" />
        <Skeleton className="h-3 w-8 mx-auto" />
      </div>
      <div className="space-y-2 min-h-[200px]">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}

// ── Add session form ──────────────────────────────────────────────────────────
interface AddSessionFormProps {
  onClose: () => void;
  onSubmit: (dto: AddSessionDTO) => void;
  isPending: boolean;
}

function AddSessionForm({ onClose, onSubmit, isPending }: AddSessionFormProps) {
  const { data: classRefs = [] } = useClassRefs();
  const { data: teacherOptions } = useTeacherOptions();
  const { data: facilityOptions } = useFacilityOptions();

  const [type, setType] = useState<"makeup" | "extra">("makeup");
  const [classId, setClassId] = useState<number>(0);
  const [teacherId, setTeacherId] = useState(0);
  const [teacherName, setTeacherName] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [room, setRoom] = useState("");
  const [notes, setNotes] = useState("");

  const handleClassChange = (idStr: string) => {
    const id = Number(idStr);
    setClassId(id);
    const found = classRefs.find((c) => c.id === id);
    if (found) {
      setTeacherId(found.teacherId);
      setTeacherName(found.teacherName);
      setStartTime(found.defaultStartTime);
      setEndTime(found.defaultEndTime);
    }
  };

  // Async conflict check
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  useEffect(() => {
    if (!date || !startTime || !endTime || !facilityId || !room) {
      setConflictWarning(null);
      return;
    }
    checkConflict(date, startTime, endTime, facilityId, room)
      .then((result) => setConflictWarning(result.hasConflict ? (result.message ?? "Trùng lịch") : null))
      .catch(() => setConflictWarning(null));
  }, [date, startTime, endTime, facilityId, room]);

  const { data: roomOptions } = useRoomsByFacility(facilityId);
  const availableRooms = roomOptions ?? [];

  const canSubmit =
    !!classId && !!date && !!startTime && !!endTime && !!room && !conflictWarning;

  const handleSubmit = () => {
    onSubmit({ type, classId, teacherId, teacherName, date, startTime, endTime, facilityId, room, notes: notes || undefined });
  };

  return (
    <>
      <div className="space-y-4 py-2 max-h-[80vh] overflow-y-auto pr-1">
        {/* Session type */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Loại buổi
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(["makeup", "extra"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex flex-col items-start p-3 rounded-lg border text-left transition-colors ${
                type === t
                  ? "bg-primary/5 border-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {t === "makeup" ? (
                  <RefreshCw className={`w-4 h-4 ${type === t ? "text-primary" : "text-muted-foreground"}`} />
                ) : (
                  <Sparkles className={`w-4 h-4 ${type === t ? "text-primary" : "text-muted-foreground"}`} />
                )}
                <span className={`text-sm font-semibold ${type === t ? "text-primary" : "text-foreground"}`}>
                  {t === "makeup" ? "Buổi học bù" : "Buổi học thêm"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t === "makeup"
                  ? "Bù cho buổi đã nghỉ. Không tính thêm phí."
                  : "Ngoài lịch thường. Tính thêm vào hóa đơn."}
              </p>
            </button>
          ))}
        </div>

        {/* Billing notice */}
        <div
          className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${
            type === "makeup"
              ? "bg-muted border-border"
              : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
          }`}
        >
          <CreditCard
            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
              type === "makeup" ? "text-muted-foreground" : "text-amber-600"
            }`}
          />
          <p className={type === "makeup" ? "text-muted-foreground" : "text-amber-700 dark:text-amber-400"}>
            {type === "makeup"
              ? "Buổi bù không được tính thêm vào hóa đơn tháng."
              : "Buổi thêm sẽ được cộng vào hóa đơn cuối tháng của học viên."}
          </p>
        </div>

        <Separator />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Thông tin buổi học
        </p>

        {/* Class */}
        <div className="space-y-2">
          <Label>
            Lớp học <span className="text-destructive">*</span>
          </Label>
          <Select value={classId ? String(classId) : ""} onValueChange={handleClassChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn lớp" />
            </SelectTrigger>
            <SelectContent>
              {classRefs.map((cls) => (
                <SelectItem key={cls.id} value={String(cls.id)}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Teacher */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              Giáo viên <span className="text-destructive">*</span>
            </Label>
            {teacherName && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3" />
                Tự điền từ lớp — có thể đổi nếu dạy thế
              </span>
            )}
          </div>
          <Select value={teacherName} onValueChange={setTeacherName}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn giáo viên" />
            </SelectTrigger>
            <SelectContent>
              {(teacherOptions ?? []).map((t) => (
                <SelectItem key={t.id} value={t.name}>
                  <div className="flex items-center gap-2">
                    <span>{t.name}</span>
                    {t.subjects?.length > 0 && (
                      <span className="text-xs text-muted-foreground">— {t.subjects.join(", ")}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label>
            Ngày học <span className="text-destructive">*</span>
          </Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {/* Time range */}
        <div className="space-y-2">
          <Label>
            Khung giờ <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-1"
            />
            <span className="text-muted-foreground text-sm">→</span>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Giờ được tự điền từ lịch lớp, có thể điều chỉnh nếu cần.
          </p>
        </div>

        {/* Facility + Room */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Cơ sở</Label>
            <Select
              value={facilityId}
              onValueChange={(v) => { setFacilityId(v); setRoom(""); }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn cơ sở" />
              </SelectTrigger>
              <SelectContent>
                {(facilityOptions ?? []).map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>
              Phòng <span className="text-destructive">*</span>
            </Label>
            <Select value={room} onValueChange={setRoom} disabled={!facilityId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phòng" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((r) => (
                  <SelectItem key={r.id} value={r.name}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conflict warning */}
        {conflictWarning && (
          <div className="flex items-start gap-2 p-3 rounded-lg border text-sm bg-destructive/10 border-destructive/20 text-destructive">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Cảnh báo trùng lịch!</p>
              <p className="text-sm mt-1">{conflictWarning}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label>{type === "makeup" ? "Lý do buổi bù" : "Ghi chú"}</Label>
          <Textarea
            placeholder={
              type === "makeup"
                ? "VD: Bù buổi T4 ngày 20/12 do nghỉ lễ..."
                : "VD: Buổi ôn thi cuối kỳ..."
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <DialogFooter className="gap-2 pt-2">
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button disabled={!canSubmit || isPending} onClick={handleSubmit}>
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-1" />
          )}
          Thêm buổi học
        </Button>
      </DialogFooter>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function AdminSchedulePage() {
  const [selectedFacilityId, setSelectedFacilityId] = useState("all");
  const [weekStart, setWeekStart] = useState(getCurrentMonday);
  const { data: facilityOpts } = useFacilityOptions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: sessions = [], isLoading: loadingSessions } = useWeekSessions(
    selectedFacilityId !== "all" ? selectedFacilityId : undefined
  );
  const { data: stats, isLoading: loadingStats } = useScheduleStats();
  const addMutation = useAddSession();

  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);
  const weekLabel = useMemo(() => buildWeekLabel(weekStart), [weekStart]);

  const prevWeek = () => setWeekStart((w) => addDays(w, -7));
  const nextWeek = () => setWeekStart((w) => addDays(w, 7));

  const sessionsForDay = (date: string) =>
    sessions.filter((s) => s.date === date);

  const handleAddSession = (dto: AddSessionDTO) => {
    addMutation.mutate(dto, {
      onSuccess: () => setIsDialogOpen(false),
    });
  };

  const statCards = [
    { label: "Buổi học tuần này", value: stats?.totalSessions, icon: Calendar },
    { label: "Lớp đang dạy", value: stats?.activeClasses, icon: BookOpen },
    { label: "Đã hoàn thành", value: stats?.completedSessions, icon: Clock },
    { label: "Giáo viên", value: stats?.activeTeachers, icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {loadingStats ? (
                    <Skeleton className="h-7 w-10 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-4">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg font-display">Lịch học tuần</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">
                {weekLabel}
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={selectedFacilityId} onValueChange={setSelectedFacilityId}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cơ sở</SelectItem>
                {(facilityOpts ?? []).map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button size="sm" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Thêm buổi học
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {loadingSessions
              ? Array.from({ length: 7 }).map((_, i) => <DaySkeleton key={i} />)
              : weekDays.map((day) => {
                  const daySessions = sessionsForDay(day.date);
                  return (
                    <div key={day.date} className="space-y-2">
                      <div className="text-center pb-2 border-b border-border">
                        <p className="font-medium text-foreground">{day.dayLabel}</p>
                        <p className="text-sm text-muted-foreground">{day.dateLabel}</p>
                      </div>
                      <div className="space-y-2 min-h-[200px]">
                        {daySessions.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">
                            Không có lịch
                          </p>
                        ) : (
                          daySessions.map((session) => (
                            <SessionCard key={session.id} session={session} />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>
        </CardContent>
      </Card>

      {/* Add session dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm buổi học</DialogTitle>
          </DialogHeader>
          <AddSessionForm
            onClose={() => setIsDialogOpen(false)}
            onSubmit={handleAddSession}
            isPending={addMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
