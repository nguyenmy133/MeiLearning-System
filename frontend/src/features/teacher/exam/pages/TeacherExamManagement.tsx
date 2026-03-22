import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "@/lib/dateUtils";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  FileCheck, 
  Plus, 
  MoreVertical,
  Edit,
  Eye,
  Copy,
  Trash2,
  Archive,
  Clock,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { useTeacherExams, useExamStats, useDeleteExam, useArchiveExam } from "../hooks";
import { EXAM_STATUS_LABELS } from "../types";


export function TeacherExamManagement() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<number | null>(null);

  // ── Service layer hooks (replaces inline mock data) ────────────────────────
  const { data: exams = [], isLoading } = useTeacherExams({
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });
  const { data: statsData } = useExamStats();
  const deleteExam = useDeleteExam();
  const archiveExam = useArchiveExam();

  const stats = statsData ?? { total: 0, ongoing: 0, ended: 0, averagePassRate: 0, draft: 0 };

  // Extract unique class names for filter
  const allClassNames = Array.from(new Set(exams.flatMap((e) => e.classNames))).sort();

  // Apply client-side class filter
  const filteredExams = classFilter === "all"
    ? exams
    : exams.filter((e) => e.classNames.includes(classFilter));

  const getStatusBadge = (status: string) => {
    const labels: Record<string, JSX.Element> = {
      draft: <Badge variant="secondary">Nháp</Badge>,
      published: <Badge className="bg-primary">Đã xuất bản</Badge>,
      upcoming: <Badge className="bg-blue-500">Sắp diễn ra</Badge>,
      ongoing: <Badge className="bg-warning">Đang diễn ra</Badge>,
      ended: <Badge className="bg-muted text-muted-foreground">Đã kết thúc</Badge>,
      archived: <Badge variant="outline">Đã lưu trữ</Badge>,
    };
    return labels[status] ?? null;
  };

  const handleDelete = (id: number) => { setExamToDelete(id); setDeleteDialogOpen(true); };

  const confirmDelete = () => {
    if (examToDelete !== null) {
      deleteExam.mutate(examToDelete);
    }
    setDeleteDialogOpen(false);
    setExamToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Quản lý bài thi
          </h1>
          <p className="text-muted-foreground mt-1">
            Tạo và quản lý bài kiểm tra cho học viên
          </p>
        </div>
        <Button onClick={() => navigate("/teacher/exams/create")} className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo bài thi mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Tổng bài thi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ongoing}</p>
                <p className="text-xs text-muted-foreground">Đang diễn ra</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ended}</p>
                <p className="text-xs text-muted-foreground">Đã kết thúc</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averagePassRate}%</p>
                <p className="text-xs text-muted-foreground">Tỷ lệ đạt TB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Tab Navigation + Class Filter */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "Tất cả", count: exams.length },
            { value: "draft", label: "Nháp", count: exams.filter((e) => e.status === "draft").length },
            { value: "upcoming", label: "Sắp diễn ra", count: exams.filter((e) => e.status === "upcoming").length },
            { value: "ongoing", label: "Đang diễn ra", count: exams.filter((e) => e.status === "ongoing").length },
            { value: "ended", label: "Đã kết thúc", count: exams.filter((e) => e.status === "ended").length },
            { value: "archived", label: "Lưu trữ", count: exams.filter((e) => e.status === "archived").length },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                statusFilter === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold ${
                  statusFilter === tab.value
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Lớp học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả lớp</SelectItem>
              {allClassNames.map((cls) => (
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Exam List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
        ) : filteredExams.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Không tìm thấy bài thi nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{exam.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary">{exam.subject}</Badge>
                          {exam.classNames.map((cls, idx) => (
                            <Badge key={idx} variant="outline">{cls}</Badge>
                          ))}
                          {getStatusBadge(exam.status)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Số câu hỏi</p>
                        <p className="font-semibold text-foreground">{exam.totalQuestions} câu</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Thời gian</p>
                        <p className="font-semibold text-foreground">{exam.duration} phút</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Đã nộp bài</p>
                        <p className="font-semibold text-foreground">
                          {exam.completedStudents}/{exam.totalStudents}
                        </p>
                      </div>
                      {exam.status !== "draft" && exam.completedStudents > 0 && (
                        <div>
                          <p className="text-muted-foreground">Điểm TB</p>
                          <p className="font-semibold text-primary">{exam.averageScore}/100</p>
                        </div>
                      )}
                    </div>

                    {exam.startTime && (
                      <p className="text-xs text-muted-foreground">
                        🕐 {formatDateTime(exam.startTime)}{exam.endTime ? ` – ${formatDateTime(exam.endTime)}` : ""}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {exam.status !== "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/teacher/exams/results/${exam.id}`)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Xem kết quả
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/teacher/exams/detail/${exam.id}`)}>
                          <Edit className="w-4 h-4 mr-2" />{exam.status === "draft" ? "Chỉnh sửa" : "Xem chi tiết"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/teacher/exams/create?duplicate=${exam.id}`)}>
                          <Copy className="w-4 h-4 mr-2" />Nhân bản
                        </DropdownMenuItem>
                        {exam.status === "ended" && (
                          <DropdownMenuItem onClick={() => archiveExam.mutate(exam.id)}>
                            <Archive className="w-4 h-4 mr-2" />Lưu trữ
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(exam.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bài thi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài thi này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
