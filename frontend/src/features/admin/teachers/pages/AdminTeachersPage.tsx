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
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap, Plus, Search, MoreHorizontal, Edit, Trash2, Eye,
  Mail, Phone, BookOpen, Filter, KeyRound, RefreshCw, Copy, Check,
  ShieldOff, ShieldCheck, Loader2, AlertTriangle,
} from "lucide-react";

// ===== Module imports =====
import {
  useTeachers, useTeacherStats,
  useCreateTeacher, useUpdateTeacher, useDeleteTeacher,
  useResetTeacherPassword, useLockTeacher, useUnlockTeacher,
} from "../hooks";
import type {
  Teacher, CreateTeacherDTO, UpdateTeacherDTO, TeacherStatusType,
} from "../types";
import { TEACHER_STATUS_LABELS } from "../types";
import { useSubjectOptions } from "@/hooks/useClassOptions";

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
// STATUS BADGE
// ============================================================================

function TeacherStatusBadge({ status }: { status: TeacherStatusType }) {
  const map: Record<TeacherStatusType, string> = {
    active: "bg-primary/10 text-primary",
    inactive: "bg-muted text-muted-foreground",
    locked: "bg-destructive/10 text-destructive",
  };
  return (
    <Badge className={`${map[status]} border-0`}>
      {TEACHER_STATUS_LABELS[status]}
    </Badge>
  );
}

// ============================================================================
// STATS CARDS
// ============================================================================

function StatsCards() {
  const { data: stats, isLoading } = useTeacherStats();

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
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    { label: "Tổng giáo viên", value: stats?.totalTeachers ?? 0, icon: GraduationCap, accent: "bg-primary/10 text-primary" },
    { label: "Đang hoạt động", value: stats?.activeTeachers ?? 0, icon: GraduationCap, accent: "bg-primary/10 text-primary" },
    { label: "Lớp đang dạy", value: stats?.totalClasses ?? 0, icon: BookOpen, accent: "bg-primary/10 text-primary" },
    { label: "Môn học", value: stats?.totalSubjects ?? 0, icon: BookOpen, accent: "bg-secondary/20 text-secondary-foreground" },
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
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ADD / EDIT TEACHER FORM
// ============================================================================

interface TeacherFormProps {
  mode: "create" | "edit";
  initial?: Teacher;
  onSubmit: (data: CreateTeacherDTO | UpdateTeacherDTO) => void;
  isPending: boolean;
}

function TeacherForm({ mode, initial, onSubmit, isPending }: TeacherFormProps) {
  const { data: subjectOptions = [] } = useSubjectOptions();
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [subjects, setSubjects] = useState<string[]>(initial?.subjects ?? []);
  const [status, setStatus] = useState<TeacherStatusType>(initial?.status ?? "active");

  // Chỉ dùng cho mode create
  const [username, setUsername] = useState("");
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false);
  const [password, setPassword] = useState(() => generatePassword());
  const [copied, setCopied] = useState(false);

  // Track touched fields
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  // Validation helpers
  const validateEmail = (val: string): string => {
    if (!val.trim()) return "Email không được để trống";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Email không đúng định dạng";
    return "";
  };

  const validatePhone = (val: string): string => {
    if (!val) return "Số điện thoại không được để trống";
    if (!/^\d{10,11}$/.test(val)) return "Số điện thoại phải có 10-11 chữ số";
    return "";
  };

  const errors = {
    name: !name.trim() ? "Họ và tên không được để trống" : "",
    email: validateEmail(email),
    phone: validatePhone(phone),
    username: mode === "create" && !username.trim() ? "Tên đăng nhập không được để trống" : "",
    password: mode === "create" && !password.trim() ? "Mật khẩu không được để trống" : "",
  };
  const isValid = !errors.name && !errors.email && !errors.phone && !errors.username && !errors.password;

  // Auto-fill username từ số điện thoại — chỉ cho phép chữ số
  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    setPhone(digitsOnly);
    if (mode === "create" && !usernameManuallyEdited) {
      setUsername(digitsOnly);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSubject = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSubmit = () => {
    // Mark all required fields as touched
    const touchAll: Record<string, boolean> = { name: true, email: true, phone: true };
    if (mode === "create") {
      touchAll.username = true;
      touchAll.password = true;
    }
    setTouched(touchAll);
    if (!isValid) return;

    if (mode === "create") {
      const dto: CreateTeacherDTO = { name: name.trim(), email: email.trim(), phone: phone.trim(), subjects, username: username.trim(), password };
      onSubmit(dto);
    } else {
      const dto: UpdateTeacherDTO = { name: name.trim(), email: email.trim(), phone: phone.trim(), subjects, status };
      onSubmit(dto);
    }
  };

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
          onChange={(e) => setName(e.target.value)}
          onBlur={() => markTouched("name")}
          placeholder="Nhập họ và tên"
          className={touched.name && errors.name ? "border-destructive" : ""}
        />
        {touched.name && errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email <span className="text-destructive">*</span></Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
            onBlur={() => markTouched("email")}
            placeholder="email@edu.vn"
            autoComplete="email"
            className={touched.email && errors.email ? "border-destructive" : ""}
          />
          {touched.email && errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Số điện thoại <span className="text-destructive">*</span></Label>
          <Input
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={() => markTouched("phone")}
            placeholder="0901234567"
            inputMode="numeric"
            maxLength={11}
            className={touched.phone && errors.phone ? "border-destructive" : ""}
          />
          {touched.phone && errors.phone && (
            <p className="text-xs text-destructive">{errors.phone}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Môn giảng dạy</Label>
        <div className="flex flex-wrap gap-2">
          {subjectOptions.map((subject) => (
            <Badge
              key={subject}
              variant={subjects.includes(subject) ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={() => toggleSubject(subject)}
            >
              {subject}
            </Badge>
          ))}
        </div>
        {subjects.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Đã chọn: {subjects.join(", ")}
          </p>
        )}
      </div>

      {/* Status – chỉ hiện khi Edit */}
      {mode === "edit" && (
        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as TeacherStatusType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TEACHER_STATUS_LABELS).map(([val, lbl]) => (
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
          <div className="space-y-2">
            <Label>Tên đăng nhập <span className="text-destructive">*</span></Label>
            <Input
              value={username}
              onChange={(e) => { setUsername(e.target.value); setUsernameManuallyEdited(true); }}
              onBlur={() => markTouched("username")}
              placeholder="Tự động điền từ SĐT hoặc nhập thủ công"
              className={touched.username && errors.username ? "border-destructive" : ""}
            />
            {touched.username && errors.username ? (
              <p className="text-xs text-destructive">{errors.username}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Tên đăng nhập tự động lấy từ số điện thoại. Có thể thay đổi thủ công.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Mật khẩu tạm thời <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Tạo lại mật khẩu"
                onClick={() => setPassword(generatePassword())}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Sao chép"
                onClick={() => handleCopy(password)}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Giáo viên nên đổi mật khẩu sau khi đăng nhập lần đầu.
            </p>
          </div>
        </>
      )}

      <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {mode === "create" ? "Thêm giáo viên" : "Cập nhật"}
      </Button>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export function AdminTeachersPage() {
  // ── Filters ──
  const { data: subjectOpts = [] } = useSubjectOptions();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // ── Dialogs ──
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [lockTarget, setLockTarget] = useState<Teacher | null>(null);
  const [resetTarget, setResetTarget] = useState<Teacher | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [copied, setCopied] = useState(false);

  // ── Queries ──
  const { data: teachersData, isLoading } = useTeachers({
    search: searchTerm || undefined,
    subject: filterSubject !== "all" ? filterSubject : undefined,
    status: filterStatus !== "all" ? (filterStatus as TeacherStatusType) : undefined,
  });

  // ── Mutations ──
  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher();
  const deleteMutation = useDeleteTeacher();
  const resetPwMutation = useResetTeacherPassword();
  const lockMutation = useLockTeacher();
  const unlockMutation = useUnlockTeacher();

  const teachers = Array.isArray(teachersData) ? teachersData : (teachersData as any)?.data ?? [];

  // ── Handlers ──
  const handleCreate = (data: CreateTeacherDTO | UpdateTeacherDTO) => {
    createMutation.mutate(data as CreateTeacherDTO, {
      onSuccess: () => {
        toast.success("Thêm giáo viên thành công");
        setIsAddOpen(false);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleUpdate = (data: CreateTeacherDTO | UpdateTeacherDTO) => {
    if (!editingTeacher) return;
    updateMutation.mutate(
      { id: editingTeacher.id, dto: data as UpdateTeacherDTO },
      {
        onSuccess: () => {
          toast.success("Cập nhật giáo viên thành công");
          setEditingTeacher(null);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDelete = () => {
    if (!deletingTeacher) return;
    deleteMutation.mutate(deletingTeacher.id, {
      onSuccess: () => {
        toast.success(`Đã xóa giáo viên "${deletingTeacher.name}"`);
        setDeletingTeacher(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenReset = (teacher: Teacher) => {
    setResetTarget(teacher);
    setNewPassword("");
    setCopied(false);
  };

  const handleCloseReset = () => {
    setResetTarget(null);
    setNewPassword("");
    setCopied(false);
  };

  const handleResetPassword = () => {
    if (!resetTarget) return;
    resetPwMutation.mutate(resetTarget.id, {
      onSuccess: (actualPassword) => {
        setNewPassword(actualPassword);
        toast.success("Đã đặt lại mật khẩu thành công");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleLockUnlock = () => {
    if (!lockTarget) return;
    const mutation = lockTarget.status === "locked" ? unlockMutation : lockMutation;
    const successMsg = lockTarget.status === "locked"
      ? `Đã mở khóa tài khoản "${lockTarget.name}"`
      : `Đã tạm khóa tài khoản "${lockTarget.name}"`;
    mutation.mutate(lockTarget.id, {
      onSuccess: () => {
        toast.success(successMsg);
        setLockTarget(null);
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
          <CardTitle className="text-lg font-display">Danh sách giáo viên</CardTitle>

          {/* ── Add Dialog ── */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Thêm giáo viên
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm giáo viên mới</DialogTitle>
              </DialogHeader>
              <TeacherForm
                mode="create"
                onSubmit={handleCreate}
                isPending={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ── Search & Filter ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, email, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn</SelectItem>
                  {subjectOpts.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {Object.entries(TEACHER_STATUS_LABELS).map(([val, lbl]) => (
                    <SelectItem key={val} value={val}>{lbl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Table ── */}
          {isLoading ? (
            <TableSkeleton />
          ) : teachers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không tìm thấy giáo viên nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Giáo viên</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">SĐT</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead className="text-center">Lớp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={teacher.avatar} />
                          <AvatarFallback>
                            {teacher.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{teacher.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="text-sm">{teacher.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span className="text-sm">{teacher.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{teacher.classCount}</TableCell>
                    <TableCell>
                      <TeacherStatusBadge status={teacher.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingTeacher(teacher)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingTeacher(teacher)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenReset(teacher)}>
                            <KeyRound className="w-4 h-4 mr-2" />
                            Đặt lại mật khẩu
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={teacher.status === "locked" ? "text-primary" : "text-secondary-foreground"}
                            onClick={() => setLockTarget(teacher)}
                          >
                            {teacher.status === "locked" ? (
                              <>
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Mở khóa tài khoản
                              </>
                            ) : (
                              <>
                                <ShieldOff className="w-4 h-4 mr-2" />
                                Tạm khóa tài khoản
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeletingTeacher(teacher)}
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
      <Dialog open={!!editingTeacher} onOpenChange={(o) => !o && setEditingTeacher(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa giáo viên</DialogTitle>
          </DialogHeader>
          {editingTeacher && (
            <TeacherForm
              mode="edit"
              initial={editingTeacher}
              onSubmit={handleUpdate}
              isPending={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
         DELETE ALERT DIALOG
         ══════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={!!deletingTeacher} onOpenChange={(o) => !o && setDeletingTeacher(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa giáo viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa giáo viên{" "}
              <span className="font-semibold text-foreground">
                "{deletingTeacher?.name}"
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
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══════════════════════════════════════════════════════════════════
         LOCK / UNLOCK DIALOG
         ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!lockTarget} onOpenChange={(o) => !o && setLockTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {lockTarget?.status === "locked" ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Mở khóa tài khoản
                </>
              ) : (
                <>
                  <ShieldOff className="w-5 h-5 text-secondary-foreground" />
                  Tạm khóa tài khoản
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            {lockTarget?.status === "locked" ? (
              <p className="text-sm text-muted-foreground">
                Mở khóa tài khoản cho giáo viên{" "}
                <span className="font-semibold text-foreground">{lockTarget.name}</span>?{" "}
                Giáo viên sẽ có thể đăng nhập và sử dụng hệ thống ngay sau đó.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Bạn sắp tạm khóa tài khoản của giáo viên{" "}
                  <span className="font-semibold text-foreground">{lockTarget?.name}</span>.
                </p>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted border border-border">
                  <ShieldOff className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    Giáo viên sẽ{" "}
                    <span className="font-semibold text-destructive">không thể đăng nhập</span>{" "}
                    cho đến khi được mở khóa. Các lớp đang phụ trách vẫn được giữ nguyên.
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setLockTarget(null)}>Hủy</Button>
            {lockTarget?.status === "locked" ? (
              <Button
                onClick={handleLockUnlock}
                disabled={unlockMutation.isPending}
              >
                {unlockMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                <ShieldCheck className="w-4 h-4 mr-1" />
                Mở khóa
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handleLockUnlock}
                disabled={lockMutation.isPending}
              >
                {lockMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                <ShieldOff className="w-4 h-4 mr-1" />
                Xác nhận khóa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
         RESET PASSWORD DIALOG
         ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!resetTarget} onOpenChange={(o) => !o && handleCloseReset()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Đặt lại mật khẩu
            </DialogTitle>
          </DialogHeader>

          {/* ── Trước khi reset: xác nhận ── */}
          {!newPassword ? (
            <>
              <div className="space-y-3 py-2">
                <p className="text-sm text-muted-foreground">
                  Bạn sắp đặt lại mật khẩu cho giáo viên{" "}
                  <span className="font-semibold text-foreground">
                    {resetTarget?.name}
                  </span>
                </p>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted border border-border">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    Mật khẩu cũ sẽ bị thay thế. Giáo viên cần dùng mật khẩu mới để đăng nhập.
                  </p>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={handleCloseReset}>Hủy</Button>
                <Button
                  onClick={handleResetPassword}
                  disabled={resetPwMutation.isPending}
                >
                  {resetPwMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Xác nhận đặt lại
                </Button>
              </DialogFooter>
            </>
          ) : (
            /* ── Sau khi reset: hiện mật khẩu mới ── */
            <>
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-sm font-medium text-primary">
                    Đặt lại mật khẩu thành công!
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Mật khẩu mới</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newPassword}
                      readOnly
                      className="font-mono text-sm font-semibold bg-muted"
                    />
                    <Button
                      type="button" variant="outline" size="icon"
                      onClick={() => handleCopy(newPassword)}
                      title="Sao chép"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Nhớ sao chép và gửi mật khẩu này cho giáo viên.</p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCloseReset} className="w-full">
                  Đã sao chép, đóng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════
         VIEW DETAIL DIALOG
         ══════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!viewingTeacher} onOpenChange={(o) => !o && setViewingTeacher(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Chi tiết giáo viên
            </DialogTitle>
          </DialogHeader>
          {viewingTeacher && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={viewingTeacher.avatar} />
                  <AvatarFallback>{viewingTeacher.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{viewingTeacher.name}</p>
                  <TeacherStatusBadge status={viewingTeacher.status} />
                </div>
              </div>
              <Separator />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thông tin liên hệ</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Số điện thoại</p>
                  <p className="font-medium flex items-center gap-1"><Phone className="w-3 h-3" />{viewingTeacher.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="font-medium flex items-center gap-1"><Mail className="w-3 h-3" />{viewingTeacher.email || "—"}</p>
                </div>
              </div>
              <Separator />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Môn giảng dạy</p>
              {viewingTeacher.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {viewingTeacher.subjects.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Chưa có môn nào</p>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lớp đang dạy</p>
                <Badge variant="outline">{viewingTeacher.classCount} lớp</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
