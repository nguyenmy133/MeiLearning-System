import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen, Plus, Search, MoreHorizontal, Edit, Trash2, Eye,
  Users, Calendar, Clock, Filter, MapPin, CheckCircle2, XCircle,
  Loader2, Info,
} from "lucide-react";

// ===== Module imports =====
import {
  useClasses, useClassStats, useTeacherRefs, useEnrolledStudents,
  useCreateClass, useUpdateClass, useDeleteClass, useEndClass,
} from "../hooks";
import type {
  Class, CreateClassDTO, UpdateClassDTO, SessionSlot, ClassStatusType,
} from "../types";
import {
  CLASS_STATUS_LABELS, WEEKDAYS, formatSchedule,
} from "../types";
import { useSubjectOptionsWithPrice, useFacilityOptions, useRoomsByFacility } from "@/hooks/useClassOptions";

// ============================================================================
// STATUS BADGE
// ============================================================================

function ClassStatusBadge({ status }: { status: ClassStatusType }) {
  const map: Record<ClassStatusType, string> = {
    active: "bg-primary/10 text-primary",
    upcoming: "bg-secondary/30 text-secondary-foreground",
    completed: "bg-muted text-muted-foreground",
  };
  return (
    <Badge className={`${map[status]} border-0`}>
      {CLASS_STATUS_LABELS[status]}
    </Badge>
  );
}

// ============================================================================
// STATS CARDS
// ============================================================================

function StatsCards() {
  const { data: stats, isLoading } = useClassStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-7 w-10" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    { label: "Tổng lớp học", value: stats?.totalClasses ?? 0, icon: BookOpen, accent: "bg-primary/10 text-primary" },
    { label: "Đang hoạt động", value: stats?.activeClasses ?? 0, icon: BookOpen, accent: "bg-primary/10 text-primary" },
    { label: "Đã kết thúc", value: stats?.completedClasses ?? 0, icon: CheckCircle2, accent: "bg-muted text-muted-foreground" },
    { label: "Sắp mở", value: stats?.upcomingClasses ?? 0, icon: Calendar, accent: "bg-secondary/20 text-secondary-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.accent}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// TABLE SKELETON
// ============================================================================

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// SCHEDULE BUILDER (shared between Create & Edit forms)
// ============================================================================

interface ScheduleBuilderProps {
  slots: SessionSlot[];
  onChange: (slots: SessionSlot[]) => void;
}

function ScheduleBuilder({ slots, onChange }: ScheduleBuilderProps) {
  const toggleDay = (weekday: number) => {
    const exists = slots.find((s) => s.weekday === weekday);
    if (exists) {
      onChange(slots.filter((s) => s.weekday !== weekday));
    } else {
      const newSlot: SessionSlot = { weekday, startTime: "18:00", endTime: "20:00" };
      // Giữ đúng thứ tự WEEKDAYS
      const order: number[] = WEEKDAYS.map((w) => w.value);
      const updated = [...slots, newSlot].sort(
        (a, b) => order.indexOf(a.weekday) - order.indexOf(b.weekday)
      );
      onChange(updated);
    }
  };

  const updateSlot = (
    weekday: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    onChange(
      slots.map((s) => (s.weekday === weekday ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="space-y-3">
      {/* Day picker */}
      <div className="flex gap-1.5 flex-wrap">
        {WEEKDAYS.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => toggleDay(day.value)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors border ${
              slots.some((s) => s.weekday === day.value)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Chọn thứ → thiết lập khung giờ riêng cho từng buổi bên dưới.
      </p>

      {/* Time pickers per day */}
      {slots.length > 0 && (
        <div className="space-y-2">
          {slots.map((slot) => {
            const dayLabel =
              WEEKDAYS.find((w) => w.value === slot.weekday)?.label ?? "?";
            return (
              <div
                key={slot.weekday}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-accent/50 border border-border"
              >
                <span className="w-8 text-sm font-semibold text-primary flex-shrink-0">
                  {dayLabel}
                </span>
                <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <TimePicker
                  value={slot.startTime}
                  onChange={(t) => updateSlot(slot.weekday, "startTime", t)}
                  placeholder="Giờ bắt đầu"
                  className="h-8 text-sm w-32 flex-shrink-0"
                />
                <span className="text-muted-foreground text-xs">→</span>
                <TimePicker
                  value={slot.endTime}
                  onChange={(t) => updateSlot(slot.weekday, "endTime", t)}
                  placeholder="Giờ kết thúc"
                  className="h-8 text-sm w-32 flex-shrink-0"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Preview */}
      {slots.length > 0 && (
        <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Lịch học</span>
          </div>
          {slots.map((s) => {
            const dayLabel =
              WEEKDAYS.find((w) => w.value === s.weekday)?.label ?? "?";
            return (
              <p key={s.weekday} className="text-sm text-foreground">
                <span className="font-semibold text-primary w-8 inline-block">
                  {dayLabel}
                </span>
                <span className="text-muted-foreground">
                  {s.startTime} – {s.endTime}
                </span>
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CLASS FORM (Create / Edit)
// ============================================================================

interface ClassFormProps {
  mode: "create" | "edit";
  initial?: Class;
  onSubmit: (data: CreateClassDTO | UpdateClassDTO) => void;
  isPending: boolean;
}

function ClassForm({ mode, initial, onSubmit, isPending }: ClassFormProps) {
  const { data: teacherRefs = [] } = useTeacherRefs();
  const { data: subjectOptionsData = [] } = useSubjectOptionsWithPrice();
  const { data: facilityOptions = [] } = useFacilityOptions();

  const [name, setName] = useState(initial?.name ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [teacherId, setTeacherId] = useState<number>(
    initial?.teacher.id ?? 0
  );
  const [facilityId, setFacilityId] = useState<string>(
    // Try to find matching facility id from options, fallback to name
    ""
  );
  const [facilityName, setFacilityName] = useState(initial?.facility ?? "");
  const [room, setRoom] = useState(initial?.room ?? "");
  const [maxStudents, setMaxStudents] = useState(
    initial?.maxStudents ?? 20
  );
  const [roomCapacity, setRoomCapacity] = useState<number>(0);
  const [pricePerSession, setPricePerSession] = useState(
    initial?.pricePerSession ?? 150000
  );
  const [schedule, setSchedule] = useState<SessionSlot[]>(
    initial?.schedule ?? []
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    initial?.startDate ? new Date(initial.startDate) : undefined
  );
  const [description, setDescription] = useState(
    initial?.description ?? ""
  );
  const [status, setStatus] = useState<ClassStatusType>(
    initial?.status ?? "upcoming"
  );

  // Initialize facilityId from initial facility name
  const matchedFacility = facilityOptions.find((f) => f.name === initial?.facility);
  const effectiveFacilityId = facilityId || (matchedFacility ? String(matchedFacility.id) : "");

  // Room options from selected facility
  const { data: roomOptions = [] } = useRoomsByFacility(effectiveFacilityId);

  // Filter teachers by selected subject
  const filteredTeachers = subject
    ? teacherRefs.filter((t) => (t as any).subjects?.includes(subject) ?? true)
    : teacherRefs;

  // When subject changes → auto-fill price from basePricePerSession
  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    const found = subjectOptionsData.find((s) => s.name === newSubject);
    if (found && found.basePricePerSession > 0) {
      setPricePerSession(found.basePricePerSession);
    }
    // Reset teacher if current teacher doesn't teach this subject
    if (teacherId) {
      const teacher = teacherRefs.find((t) => t.id === teacherId);
      if (teacher && !(teacher as any).subjects?.includes(newSubject)) {
        setTeacherId(0);
      }
    }
  };

  // When facility changes → reset room & maxStudents
  const handleFacilityChange = (fName: string) => {
    setFacilityName(fName);
    const fac = facilityOptions.find((f) => f.name === fName);
    setFacilityId(fac ? String(fac.id) : "");
    setRoom("");
    setRoomCapacity(0);
  };

  // When room changes → auto-fill maxStudents from capacity
  const handleRoomChange = (roomName: string) => {
    setRoom(roomName);
    const selectedRoom = roomOptions.find((r) => r.name === roomName);
    if (selectedRoom && selectedRoom.capacity > 0) {
      setRoomCapacity(selectedRoom.capacity);
      setMaxStudents(selectedRoom.capacity);
    } else {
      setRoomCapacity(0);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) { toast.error("Vui lòng nhập tên lớp"); return; }
    if (!subject) { toast.error("Vui lòng chọn môn học"); return; }
    if (!teacherId) { toast.error("Vui lòng chọn giáo viên"); return; }
    if (!facilityName) { toast.error("Vui lòng chọn cơ sở"); return; }
    if (!room.trim()) { toast.error("Vui lòng chọn phòng học"); return; }
    if (maxStudents < 1 || maxStudents > 200) {
      toast.error("Sĩ số tối đa phải từ 1 đến 200");
      return;
    }
    if (roomCapacity > 0 && maxStudents > roomCapacity) {
      if (!window.confirm(`Sĩ số (${maxStudents}) vượt sức chứa phòng (${roomCapacity}). Bạn có chắc muốn tiếp tục?`)) {
        return;
      }
    }
    if (pricePerSession < 0) {
      toast.error("Giá mỗi buổi không được âm");
      return;
    }
    if (schedule.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ngày học");
      return;
    }
    for (const slot of schedule) {
      if (slot.startTime >= slot.endTime) {
        const dayLabel =
          WEEKDAYS.find((w) => w.value === slot.weekday)?.label ?? "?";
        toast.error(`Giờ bắt đầu phải nhỏ hơn giờ kết thúc (${dayLabel})`);
        return;
      }
    }
    if (!startDate) { toast.error("Vui lòng chọn ngày bắt đầu"); return; }
    const startDateStr = format(startDate, "yyyy-MM-dd");
    if (mode === "create" && startDateStr < new Date().toISOString().split("T")[0]) {
      toast.error("Ngày bắt đầu không được nằm trong quá khứ");
      return;
    }

    if (mode === "create") {
      onSubmit({ name, subject, teacherId, facility: facilityName, room, maxStudents, pricePerSession, schedule, startDate: startDateStr, description } as CreateClassDTO);
    } else {
      onSubmit({ name, subject, teacherId, facility: facilityName, room, maxStudents, pricePerSession, schedule, startDate: startDateStr, description } as UpdateClassDTO);
    }
  };

  return (
    <div className="space-y-4 py-2 max-h-[75vh] overflow-y-auto pr-1">
      {/* Thông tin lớp */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Thông tin lớp
      </p>
      <div className="space-y-2">
        <Label>Tên lớp <span className="text-destructive">*</span></Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="VD: Toán 10A - K2024"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Môn học <span className="text-destructive">*</span></Label>
          <Select value={subject} onValueChange={handleSubjectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn môn" />
            </SelectTrigger>
            <SelectContent>
              {subjectOptionsData.map((s) => (
                <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Giáo viên <span className="text-destructive">*</span></Label>
          <Select
            value={teacherId ? String(teacherId) : ""}
            onValueChange={(v) => setTeacherId(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn GV" />
            </SelectTrigger>
            <SelectContent>
              {filteredTeachers.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  <div className="flex items-center gap-2">
                    <span>{t.name}</span>
                    {(t as any).subjects?.length > 0 && (
                      <span className="text-xs text-muted-foreground">— {(t as any).subjects.join(", ")}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {subject && filteredTeachers.length === 0 && (
            <p className="text-xs text-amber-600">Không có GV nào dạy môn {subject}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cơ sở <span className="text-destructive">*</span></Label>
          <Select value={facilityName} onValueChange={handleFacilityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn cơ sở" />
            </SelectTrigger>
            <SelectContent>
              {facilityOptions.map((f) => (
                <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Phòng học <span className="text-destructive">*</span></Label>
          <Select value={room} onValueChange={handleRoomChange} disabled={!effectiveFacilityId}>
            <SelectTrigger>
              <SelectValue placeholder={effectiveFacilityId ? "Chọn phòng" : "Chọn cơ sở trước"} />
            </SelectTrigger>
            <SelectContent>
              {roomOptions.map((r) => (
                <SelectItem key={r.id} value={r.name}>
                  {r.name} {r.capacity > 0 && <span className="text-muted-foreground">({r.capacity} chỗ)</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sĩ số tối đa <span className="text-destructive">*</span></Label>
          <Input
            type="number"
            min={1}
            max={200}
            value={maxStudents}
            onChange={(e) => setMaxStudents(Number(e.target.value))}
          />
          {roomCapacity > 0 && maxStudents > roomCapacity ? (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              ⚠️ Sĩ số ({maxStudents}) vượt sức chứa phòng ({roomCapacity}). Vẫn có thể lưu.
            </p>
          ) : roomCapacity > 0 ? (
            <p className="text-xs text-muted-foreground">Sức chứa phòng: {roomCapacity} chỗ.</p>
          ) : (
            <p className="text-xs text-muted-foreground">Tối đa 200 học viên.</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Giá mỗi buổi (VND)</Label>
          <Input
            type="number"
            min={0}
            step={10000}
            value={pricePerSession}
            onChange={(e) => setPricePerSession(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(pricePerSession)}
            {subject && " (tự điền từ môn học, có thể điều chỉnh)"}
          </p>
        </div>
      </div>

      {/* Trạng thái — chỉ hiện thông tin, không cho chỉnh */}
      {mode === "edit" && (
        <div className="flex items-start gap-2 p-3 rounded-lg border bg-muted/50 text-sm">
          <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div className="text-muted-foreground">
            <p>Trạng thái lớp được <strong>tự động quản lý</strong> bởi hệ thống:</p>
            <ul className="list-disc ml-4 mt-1 space-y-0.5">
              <li><strong>Sắp mở → Đang hoạt động</strong>: khi đến ngày bắt đầu</li>
              <li><strong>Đang hoạt động → Đã kết thúc</strong>: dùng nút "Kết thúc lớp" trong menu</li>
            </ul>
          </div>
        </div>
      )}

      {/* Lịch học */}
      <Separator />
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Lịch học <span className="text-destructive">*</span>
      </p>
      <ScheduleBuilder slots={schedule} onChange={setSchedule} />

      {/* Thời gian */}
      <Separator />
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Thời gian
      </p>
      <div className="space-y-2">
        <Label>Ngày bắt đầu <span className="text-destructive">*</span></Label>
        <DatePicker
          value={startDate}
          onChange={setStartDate}
          placeholder="Chọn ngày bắt đầu"
          fromDate={mode === "create" ? new Date() : undefined}
        />
        <p className="text-xs text-muted-foreground">
          Ngày kết thúc sẽ được ghi nhận khi admin bấm{" "}
          <strong>"Kết thúc lớp"</strong>.
        </p>
      </div>

      {/* Mô tả */}
      <div className="space-y-2">
        <Label>Mô tả</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả về lớp học, yêu cầu đầu vào..."
          rows={3}
        />
      </div>

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={isPending || schedule.length === 0}
      >
        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {mode === "create" ? "Tạo lớp học" : "Cập nhật"}
      </Button>
      {schedule.length === 0 && (
        <p className="text-xs text-center text-muted-foreground">
          Vui lòng chọn ít nhất một thứ trong tuần
        </p>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export function AdminClassesPage() {
  // ── Filters ──
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFacility, setFilterFacility] = useState("all");

  // ── Dialogs ──
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingClass, setViewingClass] = useState<Class | null>(null);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [endingClass, setEndingClass] = useState<Class | null>(null);
  const [studentListClass, setStudentListClass] = useState<Class | null>(null);

  // ── Enrolled students query ──
  const { data: enrolledStudents = [], isLoading: isLoadingStudents } = useEnrolledStudents(
    studentListClass?.id ?? 0
  );

  // ── Queries ──
  const { data: subjectOptsData = [] } = useSubjectOptionsWithPrice();
  const subjectOpts = subjectOptsData.map((s) => s.name);
  const { data: facilityOpts = [] } = useFacilityOptions();
  const { data: classesData, isLoading } = useClasses({
    search: searchTerm || undefined,
    subject: filterSubject !== "all" ? filterSubject : undefined,
    facility: filterFacility !== "all" ? filterFacility : undefined,
    status: filterStatus !== "all" ? (filterStatus as ClassStatusType) : undefined,
  });

  // ── Mutations ──
  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const deleteMutation = useDeleteClass();
  const endMutation = useEndClass();

  const classes = Array.isArray(classesData) ? classesData : (classesData as any)?.data ?? [];

  // ── Handlers ──
  const handleCreate = (data: CreateClassDTO | UpdateClassDTO) => {
    createMutation.mutate(data as CreateClassDTO, {
      onSuccess: () => {
        toast.success("Tạo lớp học thành công");
        setIsAddOpen(false);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleUpdate = (data: CreateClassDTO | UpdateClassDTO) => {
    if (!editingClass) return;
    updateMutation.mutate(
      { id: editingClass.id, dto: data as UpdateClassDTO },
      {
        onSuccess: () => {
          toast.success("Cập nhật lớp học thành công");
          setEditingClass(null);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDelete = () => {
    if (!deletingClass) return;
    deleteMutation.mutate(deletingClass.id, {
      onSuccess: () => {
        toast.success(`Đã xóa lớp "${deletingClass.name}"`);
        setDeletingClass(null);
      },
      onError: (err) => {
        toast.error(err.message);
        setDeletingClass(null);
      },
    });
  };

  const handleEndClass = () => {
    if (!endingClass) return;
    endMutation.mutate(endingClass.id, {
      onSuccess: () => {
        toast.success(`Đã kết thúc lớp "${endingClass.name}"`);
        setEndingClass(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Stats ── */}
      <StatsCards />

      {/* ── Main Card ── */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
          <CardTitle className="text-lg font-display">Danh sách lớp học</CardTitle>

          {/* ── Add Dialog ── */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Tạo lớp mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Tạo lớp học mới</DialogTitle>
              </DialogHeader>
              <ClassForm
                mode="create"
                onSubmit={handleCreate}
                isPending={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ── Search & Filter ── */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên lớp, giáo viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Môn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn</SelectItem>
                  {subjectOpts.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(CLASS_STATUS_LABELS).map(([val, lbl]) => (
                    <SelectItem key={val} value={val}>{lbl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterFacility} onValueChange={setFilterFacility}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Cơ sở" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cơ sở</SelectItem>
                  {facilityOpts.map((f) => (
                    <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Table ── */}
          {isLoading ? (
            <TableSkeleton />
          ) : classes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không tìm thấy lớp học nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lớp học</TableHead>
                  <TableHead>Giáo viên</TableHead>
                  <TableHead className="hidden md:table-cell">Lịch học</TableHead>
                  <TableHead className="hidden lg:table-cell">Địa điểm</TableHead>
                  <TableHead className="text-center">Sĩ số</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">Giá/buổi</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow
                    key={cls.id}
                    className={cls.status === "completed" ? "opacity-60" : ""}
                  >
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span className="font-medium">{cls.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {cls.subject}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={cls.teacher.avatar} />
                          <AvatarFallback>
                            {cls.teacher.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{cls.teacher.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {formatSchedule(cls.schedule)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {cls.room}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {cls.facility}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={
                          cls.students >= cls.maxStudents
                            ? "text-destructive font-medium"
                            : ""
                        }
                      >
                        {cls.students}/{cls.maxStudents}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-right font-medium">
                      {new Intl.NumberFormat("vi-VN").format(cls.pricePerSession)}đ
                    </TableCell>
                    <TableCell>
                      <ClassStatusBadge status={cls.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingClass(cls)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStudentListClass(cls)}>
                            <Users className="w-4 h-4 mr-2" />
                            Danh sách HV
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setEditingClass(cls)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          {/* Kết thúc lớp — chỉ active/upcoming */}
                          {(cls.status === "active" ||
                            cls.status === "upcoming") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/30"
                                onClick={() => setEndingClass(cls)}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Kết thúc lớp
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          {/* Xóa — disabled nếu active */}
                          <DropdownMenuItem
                            className={
                              cls.status === "active"
                                ? "text-muted-foreground cursor-not-allowed opacity-50"
                                : "text-destructive focus:text-destructive"
                            }
                            onClick={() => {
                              if (cls.status === "active") {
                                toast.error(
                                  "Phải kết thúc lớp trước khi xóa"
                                );
                                return;
                              }
                              setDeletingClass(cls);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════
         EDIT DIALOG
         ══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={!!editingClass}
        onOpenChange={(o) => !o && setEditingClass(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
          </DialogHeader>
          {editingClass && (
            <ClassForm
              mode="edit"
              initial={editingClass}
              onSubmit={handleUpdate}
              isPending={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
         DELETE ALERT DIALOG
         ══════════════════════════════════════════════════════════════════ */}
      <AlertDialog
        open={!!deletingClass}
        onOpenChange={(o) => !o && setDeletingClass(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa lớp học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa lớp{" "}
              <span className="font-semibold text-foreground">
                "{deletingClass?.name}"
              </span>
              ? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══════════════════════════════════════════════════════════════════
         END CLASS DIALOG
         ══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={!!endingClass}
        onOpenChange={(o) => !o && setEndingClass(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Kết thúc lớp học
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <p className="text-sm text-muted-foreground">
              Bạn đang kết thúc lớp{" "}
              <span className="font-semibold text-foreground">
                {endingClass?.name}
              </span>
              .
            </p>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted border border-border">
              <XCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">
                Lớp sẽ chuyển sang trạng thái{" "}
                <span className="font-semibold">"Đã kết thúc"</span> và ngày
                hôm nay sẽ được ghi nhận là ngày kết thúc. Học viên vẫn có
                thể xem lại lịch sử học.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEndingClass(null)}
              disabled={endMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleEndClass}
              disabled={endMutation.isPending}
            >
              {endMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              )}
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Xác nhận kết thúc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
         VIEW DETAIL DIALOG
         ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!viewingClass} onOpenChange={(o) => !o && setViewingClass(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Chi tiết lớp học
            </DialogTitle>
          </DialogHeader>
          {viewingClass && (
            <div className="space-y-4 py-2">
              {/* Tên lớp + Môn */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{viewingClass.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{viewingClass.subject}</Badge>
                    <ClassStatusBadge status={viewingClass.status} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Giáo viên */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Giáo viên</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={viewingClass.teacher.avatar} />
                  <AvatarFallback>{viewingClass.teacher.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{viewingClass.teacher.name}</span>
              </div>

              {/* Thông tin lớp */}
              <Separator />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thông tin lớp</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Cơ sở</p>
                  <p className="font-medium flex items-center gap-1"><MapPin className="w-3 h-3" />{viewingClass.facility}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Phòng</p>
                  <p className="font-medium">{viewingClass.room}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Sĩ số</p>
                  <p className="font-medium">{viewingClass.students}/{viewingClass.maxStudents}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Giá mỗi buổi</p>
                  <p className="font-medium">{new Intl.NumberFormat("vi-VN").format(viewingClass.pricePerSession)}đ</p>
                </div>
              </div>

              {/* Lịch học */}
              <Separator />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lịch học</p>
              <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
                {viewingClass.schedule.map((s) => {
                  const dayLabel = WEEKDAYS.find((w) => w.value === s.weekday)?.label ?? "?";
                  return (
                    <p key={s.weekday} className="text-sm">
                      <span className="font-semibold text-primary w-8 inline-block">{dayLabel}</span>
                      <span className="text-muted-foreground">{s.startTime} – {s.endTime}</span>
                    </p>
                  );
                })}
              </div>

              {/* Thời gian */}
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Ngày bắt đầu</p>
                  <p className="font-medium">{viewingClass.startDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Ngày kết thúc</p>
                  <p className="font-medium">{viewingClass.endDate || "Chưa kết thúc"}</p>
                </div>
              </div>

              {/* Mô tả */}
              {viewingClass.description && (
                <>
                  <Separator />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mô tả</p>
                  <p className="text-sm text-muted-foreground">{viewingClass.description}</p>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== DIALOG: Danh sách học viên ===== */}
      <Dialog open={!!studentListClass} onOpenChange={(open) => !open && setStudentListClass(null)}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          {studentListClass && (
            <>
              <DialogHeader>
                <DialogTitle>Danh sách học viên — {studentListClass.name}</DialogTitle>
                <DialogDescription>
                  Sĩ số: {studentListClass.students}/{studentListClass.maxStudents}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {isLoadingStudents ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
                  </div>
                ) : enrolledStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Chưa có học viên nào đăng ký lớp này</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">#</th>
                          <th className="text-left px-3 py-2 font-medium">Họ tên</th>
                          <th className="text-left px-3 py-2 font-medium">SĐT</th>
                          <th className="text-left px-3 py-2 font-medium">Giới tính</th>
                          <th className="text-left px-3 py-2 font-medium">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledStudents.map((student, idx) => (
                          <tr key={student.id} className="border-t hover:bg-muted/30 transition-colors">
                            <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                            <td className="px-3 py-2 font-medium">{student.name}</td>
                            <td className="px-3 py-2 text-muted-foreground">{student.phone || "—"}</td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {student.gender === "male" ? "Nam" : student.gender === "female" ? "Nữ" : "—"}
                            </td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                student.status === "active"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              }`}>
                                {student.status === "active" ? "Đang học" : student.status === "inactive" ? "Ngưng" : student.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
