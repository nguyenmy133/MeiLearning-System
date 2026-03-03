import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  GraduationCap,
  Users,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import {
  useSubjects,
  useSubjectStats,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from "../hooks";
import type { Subject, CreateSubjectDTO, UpdateSubjectDTO } from "../types";
import { SUBJECT_CATEGORIES, ALL_FACILITIES, SUBJECT_STATUS_LABELS } from "../types";

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Subject["status"] }) {
  return (
    <Badge
      className={
        status === "active"
          ? "bg-primary/10 text-primary border-0"
          : "bg-muted text-muted-foreground border-0"
      }
    >
      {SUBJECT_STATUS_LABELS[status]}
    </Badge>
  );
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </TableCell>
          <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-14" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
          <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ── Subject form ──────────────────────────────────────────────────────────────
interface SubjectFormProps {
  mode: "create" | "edit";
  initial?: Subject | null;
  onClose: () => void;
  onSubmit: (data: CreateSubjectDTO | UpdateSubjectDTO) => void;
  isPending: boolean;
}

function SubjectForm({ mode, initial, onClose, onSubmit, isPending }: SubjectFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? SUBJECT_CATEGORIES[0]);
  const [basePricePerSession, setBasePricePerSession] = useState(
    initial?.basePricePerSession ?? 0
  );
  const [status, setStatus] = useState<Subject["status"]>(initial?.status ?? "active");
  const [facilities, setFacilities] = useState<string[]>(initial?.facilities ?? []);

  const toggleFacility = (facility: string) => {
    setFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value);

  const handleSubmit = () => {
    if (mode === "create") {
      onSubmit({ name, code, description, category, basePricePerSession, facilities } as CreateSubjectDTO);
    } else {
      onSubmit({ name, code, description, category, basePricePerSession, facilities, status } as UpdateSubjectDTO);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Tên môn học <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="VD: Toán"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>
            Mã môn <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="VD: MATH"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <div className={`grid gap-4 ${mode === "edit" ? "grid-cols-2" : "grid-cols-1"}`}>
        <div className="space-y-2">
          <Label>Phân loại</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn phân loại" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {mode === "edit" && (
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as Subject["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Tạm ngừng</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>
          Giá mỗi buổi học (VND) <span className="text-destructive">*</span>
        </Label>
        <Input
          type="number"
          min={0}
          step={10000}
          value={basePricePerSession}
          onChange={(e) => setBasePricePerSession(Number(e.target.value))}
          placeholder="VD: 150000"
        />
        {basePricePerSession > 0 && (
          <p className="text-xs text-muted-foreground">
            = {formatCurrency(basePricePerSession)}₫ / buổi (giá tham khảo khi tạo lớp)
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>
          Cơ sở giảng dạy <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {ALL_FACILITIES.map((facility) => (
            <Badge
              key={facility}
              variant={facilities.includes(facility) ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => toggleFacility(facility)}
            >
              {facility}
            </Badge>
          ))}
        </div>
        {facilities.length === 0 && (
          <p className="text-xs text-destructive">Chọn ít nhất một cơ sở</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Mô tả</Label>
        <Textarea
          placeholder="Mô tả ngắn về môn học..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
          Hủy
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={isPending || !name.trim() || !code.trim() || facilities.length === 0}
        >
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {mode === "create" ? "Thêm môn học" : "Cập nhật"}
        </Button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function AdminSubjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [deleteSubject, setDeleteSubject] = useState<Subject | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: subjects = [], isLoading: loadingList } = useSubjects({
    search: searchTerm || undefined,
    category: filterCategory !== "all" ? filterCategory : undefined,
    status: filterStatus !== "all" ? (filterStatus as Subject["status"]) : undefined,
  });

  const { data: stats, isLoading: loadingStats } = useSubjectStats();

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const deleteMutation = useDeleteSubject();

  const handleCreate = (dto: CreateSubjectDTO | UpdateSubjectDTO) => {
    createMutation.mutate(dto as CreateSubjectDTO, {
      onSuccess: () => setIsAddDialogOpen(false),
    });
  };

  const handleUpdate = (dto: CreateSubjectDTO | UpdateSubjectDTO) => {
    if (!editSubject) return;
    updateMutation.mutate(
      { id: editSubject.id, dto: dto as UpdateSubjectDTO },
      { onSuccess: () => setEditSubject(null) }
    );
  };

  const handleDelete = () => {
    if (!deleteSubject) return;
    deleteMutation.mutate(deleteSubject.id, {
      onSuccess: () => setDeleteSubject(null),
    });
  };

  // ── Stats cards ───────────────────────────────────────────────────────────
  const statCards = [
    {
      label: "Tổng môn học",
      value: stats?.total,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Đang hoạt động",
      value: stats?.active,
      icon: LayoutGrid,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Tổng giáo viên",
      value: stats?.totalTeachers,
      icon: GraduationCap,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Tổng lớp học",
      value: stats?.totalClasses,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  {loadingStats ? (
                    <Skeleton className="h-7 w-12 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between pb-2">
          <CardTitle className="text-lg font-display">Danh sách môn học</CardTitle>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Thêm môn học
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, mã môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Phân loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {SUBJECT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Tạm ngừng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Môn học</TableHead>
                <TableHead className="hidden sm:table-cell">Mã môn</TableHead>
                <TableHead className="hidden md:table-cell">Phân loại</TableHead>
                <TableHead className="hidden lg:table-cell">Cơ sở giảng dạy</TableHead>
                <TableHead className="hidden md:table-cell">Giá/buổi</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Giáo viên</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Lớp học</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingList ? (
                <TableSkeleton />
              ) : subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <BookOpen className="w-8 h-8 opacity-30" />
                      <p>Không tìm thấy môn học nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {subject.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {subject.code}
                      </code>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {subject.category}
                      </Badge>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {subject.facilities.map((f) => (
                          <Badge
                            key={f}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 font-normal"
                          >
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm font-medium text-primary">
                        {new Intl.NumberFormat("vi-VN").format(subject.basePricePerSession)}₫
                      </span>
                    </TableCell>

                    <TableCell className="text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span className="text-sm">{subject.teachers}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-sm">{subject.classes}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={subject.status} />
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditSubject(subject)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteSubject(subject)}
                            disabled={subject.classes > 0}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {subject.classes > 0
                              ? `Không thể xóa (${subject.classes} lớp)`
                              : "Xóa môn học"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm môn học mới</DialogTitle>
          </DialogHeader>
          <SubjectForm
            mode="create"
            onClose={() => setIsAddDialogOpen(false)}
            onSubmit={handleCreate}
            isPending={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editSubject} onOpenChange={(open) => !open && setEditSubject(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa môn học</DialogTitle>
          </DialogHeader>
          <SubjectForm
            mode="edit"
            initial={editSubject}
            onClose={() => setEditSubject(null)}
            onSubmit={handleUpdate}
            isPending={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteSubject}
        onOpenChange={(open) => !open && setDeleteSubject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa môn học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa môn học{" "}
              <span className="font-semibold">{deleteSubject?.name}</span>? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
