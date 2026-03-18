import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Plus, Search, MoreHorizontal, Edit, Trash2, Eye,
  Mail, Phone, Filter, CreditCard, UserCheck, UserX, KeyRound,
  RefreshCw, Copy, Check, AlertTriangle, UserMinus, Loader2,
  FileSpreadsheet,
} from "lucide-react";

// ===== Module imports =====
import {
  useStudents, useStudentStats,
  useCreateStudent, useUpdateStudent, useDeleteStudent,
  useResetStudentPassword, useDropStudent, useReactivateStudent,
} from "../hooks";
import { ImportStudentsDialog } from "../components/ImportStudentsDialog";
import type {
  Student, CreateStudentDTO, UpdateStudentDTO, DropStudentDTO,
  StudentStatusType, TuitionStatusType, ClassEnrollment,
} from "../types";
import {
  STUDENT_STATUS_LABELS, TUITION_STATUS_LABELS,
  DROP_REASONS,
} from "../types";
import { useClassOptions, useEnrollableClassOptions } from "@/hooks/useClassOptions";

// ============================================================================
// HELPERS
// ============================================================================

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from(
    { length: 10 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// ============================================================================
// STATUS BADGES
// ============================================================================

function StudentStatusBadge({ status }: { status: StudentStatusType }) {
  const map: Record<StudentStatusType, string> = {
    active: "bg-primary/10 text-primary",
    inactive: "bg-muted text-muted-foreground",
  };
  return (
    <Badge className={`${map[status]} border-0`}>
      {STUDENT_STATUS_LABELS[status]}
    </Badge>
  );
}

function TuitionStatusBadge({ status }: { status: TuitionStatusType }) {
  const map: Record<TuitionStatusType, string> = {
    paid: "bg-primary/10 text-primary",
    pending: "bg-secondary/30 text-secondary-foreground",
    overdue: "bg-destructive/10 text-destructive",
  };
  return (
    <Badge className={`${map[status]} border-0`}>
      {TUITION_STATUS_LABELS[status]}
    </Badge>
  );
}

// ============================================================================
// STATS CARDS
// ============================================================================

function StatsCards() {
  const { data: stats, isLoading } = useStudentStats();

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
    { label: "Tổng học viên", value: stats?.totalStudents ?? 0, icon: Users, accent: "bg-primary/10 text-primary" },
    { label: "Đang học", value: stats?.activeStudents ?? 0, icon: UserCheck, accent: "bg-primary/10 text-primary" },
    { label: "Chưa đóng phí", value: stats?.unpaidTuitionCount ?? 0, icon: CreditCard, accent: "bg-destructive/10 text-destructive" },
    { label: "HV mới tháng này", value: stats?.newStudentsThisMonth ?? 0, icon: Plus, accent: "bg-primary/10 text-primary" },
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
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// CLASS PICKER (chip-style button group)
// ============================================================================

interface ClassPickerProps {
  selected: ClassEnrollment[];
  onChange: (classes: ClassEnrollment[]) => void;
}

function ClassPicker({ selected, onChange }: ClassPickerProps) {
  const { data: classOptions } = useEnrollableClassOptions();
  const toggle = (opt: { id: number; name: string }) => {
    const exists = selected.some((c) => c.classId === opt.id);
    onChange(
      exists
        ? selected.filter((c) => c.classId !== opt.id)
        : [...selected, { classId: opt.id, className: opt.name }]
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(classOptions ?? []).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              selected.some((c) => c.classId === opt.id)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Đã chọn: {selected.map((c) => c.className).join(", ")}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// ADD / EDIT STUDENT FORM
// ============================================================================

interface StudentFormProps {
  mode: "create" | "edit";
  initial?: Student;
  onSubmit: (data: CreateStudentDTO | UpdateStudentDTO) => void;
  isPending: boolean;
}

function StudentForm({ mode, initial, onSubmit, isPending }: StudentFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [parentPhone, setParentPhone] = useState(initial?.parentPhone ?? "");
  const [classes, setClasses] = useState<ClassEnrollment[]>(initial?.classes ?? []);
  const [tuitionStatus, setTuitionStatus] = useState<TuitionStatusType>(
    initial?.tuitionStatus ?? "pending"
  );

  // Chỉ dùng cho create — username = SĐT (auto)
  const [password, setPassword] = useState(() => generatePassword());
  const [copied, setCopied] = useState(false);

  // ── Inline field errors ──
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const setError = (field: string, msg: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: msg }));
  const clearError = (field: string) =>
    setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validatePhoneFmt = (value: string) => /^0[0-9]{9}$/.test(value);
  const validateEmailFmt = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // ── Blur handlers with async duplicate check ──

  const handleNameBlur = () => {
    if (!name.trim()) setError("name", "Vui lòng nhập họ tên");
    else clearError("name");
  };

  const handlePhoneBlur = async () => {
    if (mode === "create" && !phone.trim()) {
      setError("phone", "Vui lòng nhập số điện thoại (dùng làm tên đăng nhập)");
      return;
    }
    if (phone.trim() && !validatePhoneFmt(phone)) {
      setError("phone", "Số điện thoại không hợp lệ (VD: 0901234567)");
      return;
    }
    if (!phone.trim()) { clearError("phone"); return; }

    // Async duplicate check (only on create)
    if (mode === "create") {
      try {
        setCheckingPhone(true);
        const { checkPhoneExists } = await import("../services/studentService");
        const exists = await checkPhoneExists(phone);
        if (exists) {
          setError("phone", `Số điện thoại "${phone}" đã được sử dụng`);
        } else {
          clearError("phone");
        }
      } catch { clearError("phone"); }
      finally { setCheckingPhone(false); }
    } else {
      clearError("phone");
    }
  };

  const handleEmailBlur = async () => {
    if (email.trim() && !validateEmailFmt(email)) {
      setError("email", "Email không đúng định dạng");
      return;
    }
    if (!email.trim()) { clearError("email"); return; }

    // Async duplicate check (skip if same as initial)
    if (email.trim() && email.trim() !== initial?.email) {
      try {
        setCheckingEmail(true);
        const { checkEmailExists } = await import("../services/studentService");
        const exists = await checkEmailExists(email.trim());
        if (exists) {
          setError("email", `Email "${email.trim()}" đã được sử dụng`);
        } else {
          clearError("email");
        }
      } catch { clearError("email"); }
      finally { setCheckingEmail(false); }
    } else {
      clearError("email");
    }
  };

  const handleParentPhoneBlur = () => {
    if (parentPhone.trim() && !validatePhoneFmt(parentPhone)) {
      setError("parentPhone", "SĐT phụ huynh không hợp lệ (VD: 0911234567)");
    } else {
      clearError("parentPhone");
    }
  };

  // ── Submit with full validation ──

  const handleSubmit = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Vui lòng nhập họ tên";
    if (email.trim() && !validateEmailFmt(email)) errors.email = "Email không đúng định dạng";

    if (mode === "create") {
      if (!phone.trim()) errors.phone = "Vui lòng nhập số điện thoại (dùng làm tên đăng nhập)";
      else if (!validatePhoneFmt(phone)) errors.phone = "Số điện thoại không hợp lệ (VD: 0901234567)";
      if (!password.trim()) errors.password = "Vui lòng nhập mật khẩu";
    }

    if (phone.trim() && !validatePhoneFmt(phone)) errors.phone = "Số điện thoại không hợp lệ (VD: 0901234567)";
    if (parentPhone.trim() && !validatePhoneFmt(parentPhone)) errors.parentPhone = "SĐT phụ huynh không hợp lệ (VD: 0911234567)";

    // Keep existing async duplicate errors
    if (fieldErrors.phone?.includes("đã được sử dụng")) errors.phone = fieldErrors.phone;
    if (fieldErrors.email?.includes("đã được sử dụng")) errors.email = fieldErrors.email;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại các trường bị lỗi");
      return;
    }

    if (mode === "create") {
      onSubmit({ name, email: email.trim() || undefined, phone, parentPhone: parentPhone || undefined, classes, username: phone, password } as CreateStudentDTO);
    } else {
      onSubmit({ name, email: email.trim() || undefined, phone, parentPhone: parentPhone || undefined, classes, tuitionStatus } as UpdateStudentDTO);
    }
  };

  const inputErrorClass = (field: string) =>
    fieldErrors[field] ? "ring-1 ring-destructive border-destructive" : "";

  return (
    <div className="space-y-4 py-2">
      {/* Thông tin cá nhân */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Thông tin cá nhân
      </p>
      <div className="space-y-2">
        <Label>Họ và tên <span className="text-destructive">*</span></Label>
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); if (e.target.value.trim()) clearError("name"); }}
          onBlur={handleNameBlur}
          placeholder="Nhập họ và tên"
          className={inputErrorClass("name")}
        />
        {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) clearError("email"); }}
            onBlur={handleEmailBlur}
            placeholder="email@gmail.com"
            className={inputErrorClass("email")}
          />
          {checkingEmail && <p className="text-[10px] text-muted-foreground">Đang kiểm tra...</p>}
          {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label>Số điện thoại {mode === "create" && <span className="text-destructive">*</span>}</Label>
          <Input
            value={phone}
            onChange={(e) => { setPhone(e.target.value); if (fieldErrors.phone) clearError("phone"); }}
            onBlur={handlePhoneBlur}
            placeholder="0901234567"
            className={inputErrorClass("phone")}
          />
          {checkingPhone && <p className="text-[10px] text-muted-foreground">Đang kiểm tra...</p>}
          {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
          {mode === "create" && phone && !fieldErrors.phone && (
            <p className="text-[10px] text-muted-foreground">Tên đăng nhập sẽ là: <span className="font-mono font-semibold">{phone}</span></p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label>SĐT Phụ huynh</Label>
        <Input
          value={parentPhone}
          onChange={(e) => { setParentPhone(e.target.value); if (fieldErrors.parentPhone) clearError("parentPhone"); }}
          onBlur={handleParentPhoneBlur}
          placeholder="0911234567"
          className={inputErrorClass("parentPhone")}
        />
        {fieldErrors.parentPhone && <p className="text-xs text-destructive">{fieldErrors.parentPhone}</p>}
      </div>

      {/* Lớp đăng ký */}
      <Separator />
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Lớp đăng ký
      </p>
      <ClassPicker selected={classes} onChange={setClasses} />

      {/* Trạng thái học phí – chỉ hiện khi Edit */}
      {mode === "edit" && (
        <div className="space-y-2">
          <Label>Trạng thái học phí</Label>
          <Select
            value={tuitionStatus}
            onValueChange={(v) => setTuitionStatus(v as TuitionStatusType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TUITION_STATUS_LABELS).map(([val, lbl]) => (
                <SelectItem key={val} value={val}>{lbl}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Tài khoản hệ thống – chỉ hiện khi Create */}
      {mode === "create" && (
        <>
          <Separator />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Tài khoản hệ thống
          </p>
          <div className="p-3 rounded-lg bg-secondary/50 space-y-0.5">
            <p className="text-xs text-muted-foreground">Tên đăng nhập (tự động = Số điện thoại)</p>
            {phone ? (
              <p className="font-mono font-semibold text-sm">{phone}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">— nhập SĐT ở trên để tự điền</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Mật khẩu tạm thời <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <Input
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) clearError("password"); }}
                className={`font-mono text-sm ${inputErrorClass("password")}`}
              />
              <Button
                type="button" variant="outline" size="icon"
                title="Tạo lại mật khẩu"
                onClick={() => setPassword(generatePassword())}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                type="button" variant="outline" size="icon"
                title="Sao chép"
                onClick={() => handleCopy(password)}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
            <p className="text-xs text-muted-foreground">
              Học viên nên đổi mật khẩu sau khi đăng nhập lần đầu.
            </p>
          </div>
        </>
      )}


      <Button className="w-full" onClick={handleSubmit} disabled={isPending || checkingPhone || checkingEmail}>
        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {mode === "create" ? "Thêm học viên" : "Cập nhật"}
      </Button>
    </div>
  );
}


// ============================================================================
// DROP STUDENT DIALOG CONTENT
// ============================================================================

interface DropDialogProps {
  student: Student;
  onConfirm: (dto: DropStudentDTO) => void;
  onCancel: () => void;
  isPending: boolean;
}

function DropDialogContent({ student, onConfirm, onCancel, isPending }: DropDialogProps) {
  const [dropDate, setDropDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dropReason, setDropReason] = useState("");
  const [dropNotes, setDropNotes] = useState("");

  const hasDebt =
    student.tuitionStatus === "overdue" ||
    student.tuitionStatus === "pending";

  const handleConfirm = () => {
    if (!dropDate) { toast.error("Vui lòng chọn ngày nghỉ học"); return; }
    if (!dropReason) { toast.error("Vui lòng chọn lý do nghỉ học"); return; }
    onConfirm({ reason: dropReason, notes: dropNotes || undefined, dropDate });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserMinus className="w-5 h-5 text-destructive" />
          Ghi nhận nghỉ học & Khóa tài khoản
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-1">
        <p className="text-sm text-muted-foreground">
          Học viên:{" "}
          <span className="font-semibold text-foreground">{student.name}</span>
        </p>

        {/* Cảnh báo khóa tài khoản */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted border border-border">
          <UserX className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground">
            Tài khoản của học viên sẽ bị{" "}
            <span className="font-semibold text-destructive">khóa ngay lập tức</span>.
            Học viên sẽ không thể đăng nhập cho đến khi được kích hoạt lại.
          </p>
        </div>

        {/* Cảnh báo còn nợ học phí */}
        {hasDebt && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-destructive">Học viên còn nợ học phí</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Vui lòng xử lý học phí còn tồn đọng trước hoặc ghi chú để theo dõi sau.
              </p>
            </div>
          </div>
        )}

        {/* Ngày nghỉ */}
        <div className="space-y-2">
          <Label>
            Ngày nghỉ học hiệu lực <span className="text-destructive">*</span>
          </Label>
          <Input
            type="date"
            value={dropDate}
            onChange={(e) => setDropDate(e.target.value)}
          />
        </div>

        {/* Lý do nghỉ */}
        <div className="space-y-2">
          <Label>
            Lý do nghỉ học <span className="text-destructive">*</span>
          </Label>
          <Select value={dropReason} onValueChange={setDropReason}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn lý do..." />
            </SelectTrigger>
            <SelectContent>
              {DROP_REASONS.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ghi chú – hiện khi đã chọn lý do */}
        {dropReason !== "" && (
          <div className="space-y-2">
            <Label>Ghi chú thêm</Label>
            <Textarea
              placeholder="Nhập ghi chú nếu cần..."
              value={dropNotes}
              onChange={(e) => setDropNotes(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Hủy
        </Button>
        <Button
          variant="destructive"
          disabled={!dropReason || !dropDate || isPending}
          onClick={handleConfirm}
        >
          {isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
          <UserX className="w-4 h-4 mr-1" />
          Nghỉ học & Khóa tài khoản
        </Button>
      </DialogFooter>
    </>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export function AdminStudentsPage() {
  // ── Filters ──
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClassId, setFilterClassId] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTuition, setFilterTuition] = useState("all");
  const { data: classOptions } = useClassOptions();

  // ── Dialogs ──
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [droppingStudent, setDroppingStudent] = useState<Student | null>(null);
  const [reactivatingStudent, setReactivatingStudent] = useState<Student | null>(null);
  const [resetTarget, setResetTarget] = useState<Student | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [copied, setCopied] = useState(false);

  // ── Queries ──
  const { data: studentsData, isLoading } = useStudents({
    search: searchTerm || undefined,
    classId: filterClassId !== "all" ? Number(filterClassId) : undefined,
    status: filterStatus !== "all" ? (filterStatus as StudentStatusType) : undefined,
    tuitionStatus: filterTuition !== "all" ? (filterTuition as TuitionStatusType) : undefined,
  });

  // ── Mutations ──
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();
  const resetPwMutation = useResetStudentPassword();
  const dropMutation = useDropStudent();
  const reactivateMutation = useReactivateStudent();

  const students = Array.isArray(studentsData) ? studentsData : (studentsData as any)?.data ?? [];

  // ── Handlers ──
  const handleCreate = (data: CreateStudentDTO | UpdateStudentDTO) => {
    createMutation.mutate(data as CreateStudentDTO, {
      onSuccess: () => {
        toast.success("Thêm học viên thành công");
        setIsAddOpen(false);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleUpdate = (data: CreateStudentDTO | UpdateStudentDTO) => {
    if (!editingStudent) return;
    updateMutation.mutate(
      { id: editingStudent.id, dto: data as UpdateStudentDTO },
      {
        onSuccess: () => {
          toast.success("Cập nhật học viên thành công");
          setEditingStudent(null);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDelete = () => {
    if (!deletingStudent) return;
    deleteMutation.mutate(deletingStudent.id, {
      onSuccess: () => {
        toast.success(`Đã xóa học viên "${deletingStudent.name}"`);
        setDeletingStudent(null);
      },
      onError: (err) => {
        toast.error(err.message);
        setDeletingStudent(null);
      },
    });
  };

  const handleDrop = (dto: DropStudentDTO) => {
    if (!droppingStudent) return;
    dropMutation.mutate(
      { id: droppingStudent.id, dto },
      {
        onSuccess: () => {
          toast.success(`Đã ghi nhận nghỉ học cho "${droppingStudent.name}"`);
          setDroppingStudent(null);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleReactivate = () => {
    if (!reactivatingStudent) return;
    reactivateMutation.mutate(reactivatingStudent.id, {
      onSuccess: () => {
        toast.success(`Đã kích hoạt lại học viên "${reactivatingStudent.name}"`);
        setReactivatingStudent(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenReset = (student: Student) => {
    setResetTarget(student);
    setNewPassword(generatePassword());
  };

  const handleResetPassword = () => {
    if (!resetTarget) return;
    resetPwMutation.mutate(resetTarget.id, {
      onSuccess: () => {
        setNewPassword(generatePassword());
        toast.success("Đã đặt lại mật khẩu thành công");
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
          <CardTitle className="text-lg font-display">Danh sách học viên</CardTitle>

          <div className="flex items-center gap-2">
            {/* Import Excel button */}
            <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)}>
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              Import Excel
            </Button>

            {/* ── Add Dialog ── */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Thêm học viên
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm học viên mới</DialogTitle>
              </DialogHeader>
              <StudentForm
                mode="create"
                onSubmit={handleCreate}
                isPending={createMutation.isPending}
              />
            </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        {/* Import Excel Dialog */}
        <ImportStudentsDialog open={isImportOpen} onOpenChange={setIsImportOpen} />

        <CardContent className="space-y-4">
          {/* ── Search & Filter ── */}

          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, email, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterClassId} onValueChange={setFilterClassId}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Lớp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả lớp</SelectItem>
                  {(classOptions ?? []).map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>{opt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(STUDENT_STATUS_LABELS).map(([val, lbl]) => (
                    <SelectItem key={val} value={val}>{lbl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterTuition} onValueChange={setFilterTuition}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Học phí" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(TUITION_STATUS_LABELS).map(([val, lbl]) => (
                    <SelectItem key={val} value={val}>{lbl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Table ── */}
          {isLoading ? (
            <TableSkeleton />
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không tìm thấy học viên nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Học viên</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">SĐT</TableHead>
                  <TableHead className="hidden sm:table-cell">Lớp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Học phí</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow
                    key={student.id}
                    className={student.status === "inactive" ? "opacity-60" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>
                            {student.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium block">{student.name}</span>
                          {student.dropDate && (
                            <span className="text-xs text-muted-foreground">
                              Nghỉ từ {student.dropDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="text-sm">{student.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span className="text-sm">{student.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {student.classes.slice(0, 2).map((c) => (
                          <Badge key={c.classId} variant="secondary" className="text-xs">
                            {c.className}
                          </Badge>
                        ))}
                        {student.classes.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{student.classes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StudentStatusBadge status={student.status} />
                    </TableCell>
                    <TableCell>
                      <TuitionStatusBadge status={student.tuitionStatus} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingStudent(student)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenReset(student)}>
                            <KeyRound className="w-4 h-4 mr-2" />
                            Đặt lại mật khẩu
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {/* Nghiệp vụ: Drop / Reactivate */}
                          {student.status === "active" ? (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDroppingStudent(student)}
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Ghi nhận nghỉ học
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-primary focus:text-primary"
                              onClick={() => setReactivatingStudent(student)}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Mở khóa & Kích hoạt lại
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {/* Xóa vĩnh viễn – chỉ enable khi inactive */}
                          <DropdownMenuItem
                            className={
                              student.status === "active"
                                ? "text-muted-foreground cursor-not-allowed opacity-50"
                                : "text-destructive focus:text-destructive"
                            }
                            onClick={() => {
                              if (student.status === "active") {
                                toast.error("Phải ghi nhận nghỉ học trước khi xóa");
                                return;
                              }
                              setDeletingStudent(student);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa vĩnh viễn
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
        open={!!editingStudent}
        onOpenChange={(o) => !o && setEditingStudent(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa học viên</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <StudentForm
              mode="edit"
              initial={editingStudent}
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
        open={!!deletingStudent}
        onOpenChange={(o) => !o && setDeletingStudent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa học viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa vĩnh viễn học viên{" "}
              <span className="font-semibold text-foreground">
                "{deletingStudent?.name}"
              </span>
              ? Toàn bộ dữ liệu sẽ bị xóa và không thể khôi phục.
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
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══════════════════════════════════════════════════════════════════
         DROP DIALOG
         ══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={!!droppingStudent}
        onOpenChange={(o) => !o && setDroppingStudent(null)}
      >
        <DialogContent className="max-w-md">
          {droppingStudent && (
            <DropDialogContent
              student={droppingStudent}
              onConfirm={handleDrop}
              onCancel={() => setDroppingStudent(null)}
              isPending={dropMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
         REACTIVATE ALERT DIALOG
         ══════════════════════════════════════════════════════════════════ */}
      <AlertDialog
        open={!!reactivatingStudent}
        onOpenChange={(o) => !o && setReactivatingStudent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Kích hoạt lại học viên
            </AlertDialogTitle>
            <AlertDialogDescription>
              Kích hoạt lại tài khoản cho học viên{" "}
              <span className="font-semibold text-foreground">
                "{reactivatingStudent?.name}"
              </span>
              ?{" "}
              Học viên sẽ có thể đăng nhập ngay, trạng thái học phí sẽ được
              đặt về{" "}
              <span className="font-semibold">Chờ đóng</span> để admin xác nhận
              lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReactivate}
              disabled={reactivateMutation.isPending}
            >
              {reactivateMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              <UserCheck className="w-4 h-4 mr-1" />
              Kích hoạt lại
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══════════════════════════════════════════════════════════════════
         RESET PASSWORD DIALOG
         ══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={!!resetTarget}
        onOpenChange={(o) => !o && setResetTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Đặt lại mật khẩu
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Đặt lại mật khẩu cho học viên{" "}
              <span className="font-semibold text-foreground">
                {resetTarget?.name}
              </span>
            </p>
            <div className="space-y-2">
              <Label>Mật khẩu mới</Label>
              <div className="flex gap-2">
                <Input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  type="button" variant="outline" size="icon"
                  onClick={() => setNewPassword(generatePassword())}
                  title="Tạo lại"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  type="button" variant="outline" size="icon"
                  onClick={() => handleCopy(newPassword)}
                  title="Sao chép"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Nhớ gửi mật khẩu này cho học viên.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setResetTarget(null)}>
              Hủy
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetPwMutation.isPending}
            >
              {resetPwMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Xác nhận đặt lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
         VIEW DETAIL DIALOG
         ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!viewingStudent} onOpenChange={(o) => !o && setViewingStudent(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Chi tiết học viên
            </DialogTitle>
          </DialogHeader>
          {viewingStudent && (
            <div className="space-y-4 py-2">
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={viewingStudent.avatar} />
                  <AvatarFallback>{viewingStudent.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{viewingStudent.name}</p>
                  <StudentStatusBadge status={viewingStudent.status} />
                </div>
              </div>

              <Separator />

              {/* Thông tin cá nhân */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thông tin cá nhân</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Số điện thoại</p>
                  <p className="font-medium flex items-center gap-1"><Phone className="w-3 h-3" />{viewingStudent.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="font-medium flex items-center gap-1"><Mail className="w-3 h-3" />{viewingStudent.email || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">SĐT Phụ huynh</p>
                  <p className="font-medium">{viewingStudent.parentPhone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Ngày đăng ký</p>
                  <p className="font-medium">{viewingStudent.enrollDate || "—"}</p>
                </div>
              </div>

              {/* Lớp đăng ký */}
              <Separator />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lớp đăng ký</p>
              {viewingStudent.classes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {viewingStudent.classes.map((c) => (
                    <Badge key={c.classId} variant="secondary">{c.className}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Chưa đăng ký lớp nào</p>
              )}

              {/* Học phí */}
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Học phí</p>
                <TuitionStatusBadge status={viewingStudent.tuitionStatus} />
              </div>

              {/* Thông tin nghỉ học (nếu có) */}
              {viewingStudent.status === "inactive" && viewingStudent.dropDate && (
                <>
                  <Separator />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thông tin nghỉ học</p>
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm space-y-1">
                    <p><span className="text-muted-foreground">Ngày nghỉ:</span> <span className="font-medium">{viewingStudent.dropDate}</span></p>
                    {viewingStudent.dropReason && <p><span className="text-muted-foreground">Lý do:</span> <span className="font-medium">{viewingStudent.dropReason}</span></p>}
                    {viewingStudent.dropNotes && <p><span className="text-muted-foreground">Ghi chú:</span> <span className="font-medium">{viewingStudent.dropNotes}</span></p>}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
