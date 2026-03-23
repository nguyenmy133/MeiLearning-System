import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Save,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  FileCheck,
  Award,
  Users,
  Info,
} from "lucide-react";
import { useClassGrades, useGradeStats, useUpdateComment } from "../hooks";
import type { StudentGrade } from "../types";
import { useClasses } from "@/features/admin/classes/hooks";
import { Skeleton } from "@/components/ui/skeleton";

// ── Data ─────────────────────────────────────────────────────────────────
// Exams that have ended → grades are auto-generated from student submissions
// Consistent with TeacherExamManagement mock data

interface Exam {
  id: number;
  title: string;        // Tên bài thi = tên cột điểm
  date: string;
}

interface StudentExamScore {
  examId: number;
  score: number;         // Thang 10
  passed: boolean;
}

interface Student {
  id: number;
  studentId: string;
  name: string;
  avatar: string;
  examScores: StudentExamScore[];
  avgScore: number;
  trend: "up" | "down" | "stable";
  comment: string;
}




// ── Helpers ──────────────────────────────────────────────────────────────

const getScoreColor = (score: number) => {
  if (score >= 8) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 6.5) return "text-blue-600 dark:text-blue-400";
  if (score >= 5) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
};

const getScoreBg = (score: number) => {
  if (score >= 8) return "bg-emerald-100 dark:bg-emerald-900/30";
  if (score >= 6.5) return "bg-blue-100 dark:bg-blue-900/30";
  if (score >= 5) return "bg-amber-100 dark:bg-amber-900/30";
  return "bg-destructive/10";
};

const getScoreLabel = (score: number) => {
  if (score >= 8) return "Giỏi";
  if (score >= 6.5) return "Khá";
  if (score >= 5) return "TB";
  return "Yếu";
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up": return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    case "down": return <TrendingDown className="w-4 h-4 text-destructive" />;
    default: return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase();

// ── Component ───────────────────────────────────────────────────────────

export function TeacherGradesPage() {
  const navigate = useNavigate();
  const [selectedClassId, setSelectedClassId] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Sticky column scroll detection
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Comment dialog
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentGrade | null>(null);
  const [newComment, setNewComment] = useState("");

  // ── Service layer hooks ──────────────────────────────────────────────────
  // Backend tự filter lớp theo teacher từ JWT
  const { data: myClasses = [] } = useClasses({ limit: 50 });

  // Auto-select first class khi danh sách load xong
  const effectiveClassId = selectedClassId || (myClasses.length > 0 ? myClasses[0].id : 0);

  const { data: students = [], isLoading: studentsLoading } = useClassGrades(effectiveClassId, {
    search: searchTerm || undefined,
  });
  const { data: gradeStatsData } = useGradeStats(effectiveClassId);
  const updateComment = useUpdateComment();

  // Derive exam columns from student data
  const completedExams = students[0]?.examScores ?? [];

  // Detect horizontal scroll position for sticky column shadows
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, completedExams]);

  // ── Drag-to-scroll ──────────────────────────────────────────────────────
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Only activate on left mouse button and not on interactive elements
    if (e.button !== 0) return;
    const tag = (e.target as HTMLElement).closest('button, a, input, textarea');
    if (tag) return;
    isDragging.current = true;
    dragStartX.current = e.pageX - el.offsetLeft;
    dragScrollLeft.current = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5; // Speed multiplier
    el.scrollLeft = dragScrollLeft.current - walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    const el = scrollContainerRef.current;
    if (!el) return;
    el.style.cursor = '';
    el.style.userSelect = '';
  }, []);

  useEffect(() => {
    const onMouseUp = () => handleMouseUp();
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, [handleMouseUp]);

  // Computed grade distribution — backend trả avg/pass/fail/total
  const classAvg = (gradeStatsData as any)?.avg ?? (gradeStatsData as any)?.averageScore ?? 0;
  const gioi = students.filter((s) => s.avgScore >= 8).length;
  const kha = students.filter((s) => s.avgScore >= 6.5 && s.avgScore < 8).length;
  const tb = students.filter((s) => s.avgScore >= 5 && s.avgScore < 6.5).length;
  const yeu = students.filter((s) => s.avgScore < 5).length;

  // Comment handlers
  const openCommentDialog = (student: StudentGrade) => {
    setEditingStudent(student);
    setNewComment(student.comment);
    setShowCommentDialog(true);
  };

  const handleSaveComment = () => {
    if (!editingStudent) return;
    updateComment.mutate({
      studentId: editingStudent.studentId,
      classId: effectiveClassId,
      comment: newComment.trim(),
    });
    setShowCommentDialog(false);
    setEditingStudent(null);
    setNewComment("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Tổng hợp điểm
          </h1>
          <p className="text-muted-foreground mt-1">
            Điểm tự động từ kết quả bài thi • Giáo viên thêm nhận xét
          </p>
        </div>
        <Select
          value={String(effectiveClassId || "")}
          onValueChange={(v) => setSelectedClassId(Number(v))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn lớp" />
          </SelectTrigger>
          <SelectContent>
            {myClasses.length === 0 ? (
              <SelectItem value="0" disabled>Chưa có lớp</SelectItem>
            ) : (
              myClasses.map((cls: any) => (
                <SelectItem key={cls.id} value={String(cls.id)}>
                  {cls.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Info banner */}
      <Card className="border-blue-200/50 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 text-sm">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-blue-700 dark:text-blue-300">
              <p className="font-medium">Điểm được tính tự động từ bài thi</p>
              <p className="text-blue-600/80 dark:text-blue-400/80 mt-0.5">
                Học viên làm bài thi trực tuyến → Hệ thống tự chấm → Điểm hiển thị tại đây.
                Giáo viên có thể thêm nhận xét cho từng học viên.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getScoreBg(classAvg)}`}>
                <Award className={`h-5 w-5 ${getScoreColor(classAvg)}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${getScoreColor(classAvg)}`}>
                  {classAvg.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Điểm TB lớp</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{gioi}</p>
                <p className="text-xs text-muted-foreground">Giỏi (≥8.0)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{kha}</p>
                <p className="text-xs text-muted-foreground">Khá (6.5-8.0)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{tb}</p>
                <p className="text-xs text-muted-foreground">TB (5.0-6.5)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Users className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{yeu}</p>
                <p className="text-xs text-muted-foreground">Yếu (&lt;5.0)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên hoặc mã học viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate("/teacher/exams")}
            >
              <FileCheck className="w-4 h-4" />
              Quản lý bài thi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display">Bảng điểm tổng hợp</CardTitle>
          <CardDescription>
            Điểm thang 10 — Tự động từ {completedExams.length} bài thi
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            {/* Right-edge gradient scroll indicator */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent z-30 pointer-events-none" />
            )}
            {/* Use raw <table> instead of <Table> component to avoid nested overflow wrapper that breaks position:sticky */}
            <div
              className="relative w-full overflow-auto cursor-grab scroll-smooth [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.2)_transparent]"
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground w-12 sticky left-0 z-20 bg-card">#</th>
                    <th
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground min-w-[180px] sticky left-12 z-20 bg-card border-r border-border/50 transition-shadow duration-200"
                      style={canScrollLeft ? { boxShadow: '4px 0 6px -2px rgba(0,0,0,0.1)' } : undefined}
                    >
                      Học viên
                    </th>
                    {completedExams.map((exam) => (
                      <th key={exam.examId} className="h-12 px-4 text-center align-middle font-medium text-muted-foreground min-w-[120px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="text-xs hover:text-primary transition-colors cursor-pointer underline-offset-2 hover:underline"
                              onClick={() => navigate(`/teacher/exams/results/${exam.examId}`)}
                            >
                              {exam.examTitle}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ngày thi: {exam.date}</p>
                            <p className="text-xs text-muted-foreground">Click để xem chi tiết</p>
                          </TooltipContent>
                        </Tooltip>
                      </th>
                    ))}
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">TB</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground min-w-[200px]">Nhận xét</th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-16"></th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {studentsLoading ? (
                    <tr className="border-b"><td colSpan={99} className="p-4"><Skeleton className="h-8 w-full" /></td></tr>
                  ) : students.map((student, index) => (
                    <tr key={student.id} className={`border-b transition-colors hover:bg-muted/50 ${student.avgScore < 5 ? "bg-destructive/5" : ""}`}>
                      <td className="p-4 text-center text-muted-foreground text-sm align-middle sticky left-0 z-10 bg-card">
                        {index + 1}
                      </td>
                      <td
                        className="p-4 align-middle sticky left-12 z-10 bg-card border-r border-border/50 transition-shadow duration-200"
                        style={canScrollLeft ? { boxShadow: '4px 0 6px -2px rgba(0,0,0,0.1)' } : undefined}
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.studentId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Exam scores — dynamic columns */}
                      {completedExams.map((exam) => {
                        const result = student.examScores.find((es) => es.examId === exam.examId);
                        return (
                          <td key={exam.examId} className="p-4 align-middle text-center">
                            {result ? (
                              <span className={`font-semibold ${getScoreColor(result.score)}`}>
                                {result.score.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/50">—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Average */}
                      <td className="p-4 align-middle text-center">
                        <span className={`font-bold text-base ${getScoreColor(student.avgScore)}`}>
                          {student.avgScore.toFixed(1)}
                        </span>
                      </td>

                      {/* Comment */}
                      <td className="p-4 align-middle">
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {student.comment || <span className="italic text-muted-foreground/50">Chưa có nhận xét</span>}
                        </p>
                      </td>

                      {/* Action — edit comment */}
                      <td className="p-4 align-middle">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openCommentDialog(student)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!studentsLoading && students.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Không tìm thấy học viên nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed exams reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-primary" />
            Bài thi đã lấy điểm
          </CardTitle>
          <CardDescription>Các bài thi đã kết thúc, điểm được tổng hợp vào bảng trên</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {completedExams.map((exam) => (
              <div
                key={exam.examId}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <FileCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{exam.examTitle}</p>
                    <p className="text-xs text-muted-foreground">Ngày thi: {exam.date}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => navigate(`/teacher/exams/results/${exam.examId}`)}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Xem kết quả
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Nhận xét học viên
            </DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={editingStudent.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(editingStudent.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{editingStudent.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {editingStudent.studentId} • TB: {" "}
                    <span className={`font-bold ${getScoreColor(editingStudent.avgScore)}`}>
                      {editingStudent.avgScore.toFixed(1)}
                    </span>
                    {" "}({getScoreLabel(editingStudent.avgScore)})
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Nhận xét</label>
                <Textarea
                  placeholder="Nhập nhận xét cho học viên..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Nhận xét sẽ hiển thị trên trang kết quả học tập của học viên.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSaveComment}>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu nhận xét
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
