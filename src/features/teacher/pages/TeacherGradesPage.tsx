import { useState } from "react";
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
import { toast } from "sonner";

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

const classes = [
  { id: 1, name: "Toán 10A" },
  { id: 2, name: "Toán 11A" },
  { id: 3, name: "Toán 12B" },
];

// Bài thi đã kết thúc cho lớp Toán 10A (consistent with TeacherExamManagement)
const completedExams: Exam[] = [
  { id: 1, title: "Kiểm tra giữa kỳ - Toán 12", date: "20/01/2024" },
  { id: 2, title: "Bài tập tuần 3 - Đạo hàm", date: "29/01/2024" },
];

// Học viên với điểm TỪ BÀI THI (thang 10, tự chấm)
const studentsData: Student[] = [
  {
    id: 1, studentId: "HV001", name: "Nguyễn Minh Anh", avatar: "",
    examScores: [
      { examId: 1, score: 8.5, passed: true },
      { examId: 2, score: 9.0, passed: true },
    ],
    avgScore: 8.8, trend: "up",
    comment: "Học tập chăm chỉ, tiến bộ tốt trong các bài kiểm tra.",
  },
  {
    id: 2, studentId: "HV002", name: "Trần Văn Bình", avatar: "",
    examScores: [
      { examId: 1, score: 7.0, passed: true },
      { examId: 2, score: 6.5, passed: true },
    ],
    avgScore: 6.8, trend: "down",
    comment: "Cần chú ý hơn trong phần hình học.",
  },
  {
    id: 3, studentId: "HV003", name: "Lê Thị Chi", avatar: "",
    examScores: [
      { examId: 1, score: 9.2, passed: true },
      { examId: 2, score: 8.5, passed: true },
    ],
    avgScore: 8.9, trend: "up",
    comment: "Xuất sắc! Có khả năng tư duy logic tốt.",
  },
  {
    id: 4, studentId: "HV004", name: "Phạm Đức Duy", avatar: "",
    examScores: [
      { examId: 1, score: 7.8, passed: true },
      { examId: 2, score: 7.5, passed: true },
    ],
    avgScore: 7.7, trend: "stable",
    comment: "Ổn định, cần luyện tập thêm.",
  },
  {
    id: 5, studentId: "HV005", name: "Hoàng Thị Em", avatar: "",
    examScores: [
      { examId: 1, score: 4.5, passed: false },
      { examId: 2, score: 5.0, passed: false },
    ],
    avgScore: 4.8, trend: "down",
    comment: "Cần hỗ trợ thêm, nên đăng ký học phụ đạo.",
  },
  {
    id: 6, studentId: "HV006", name: "Vũ Văn Phong", avatar: "",
    examScores: [
      { examId: 1, score: 9.5, passed: true },
      { examId: 2, score: 10, passed: true },
    ],
    avgScore: 9.8, trend: "up",
    comment: "Học sinh xuất sắc, có thể tham gia đội tuyển.",
  },
  {
    id: 7, studentId: "HV007", name: "Đặng Thị Giang", avatar: "",
    examScores: [
      { examId: 1, score: 7.5, passed: true },
      { examId: 2, score: 8.0, passed: true },
    ],
    avgScore: 7.8, trend: "up",
    comment: "Tiến bộ đều đặn, rất tích cực trong lớp.",
  },
  {
    id: 8, studentId: "HV008", name: "Bùi Minh Hoàng", avatar: "",
    examScores: [
      { examId: 1, score: 6.5, passed: true },
      { examId: 2, score: 7.0, passed: true },
    ],
    avgScore: 6.8, trend: "up",
    comment: "Khá tốt, cần cải thiện kỹ năng giải bài tập nhanh.",
  },
];

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
  const [selectedClass, setSelectedClass] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState(studentsData);

  // Comment dialog
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newComment, setNewComment] = useState("");

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Computed stats
  const classAvg = students.length > 0
    ? (students.reduce((sum, s) => sum + s.avgScore, 0) / students.length)
    : 0;
  const gioi = students.filter((s) => s.avgScore >= 8).length;
  const kha = students.filter((s) => s.avgScore >= 6.5 && s.avgScore < 8).length;
  const tb = students.filter((s) => s.avgScore >= 5 && s.avgScore < 6.5).length;
  const yeu = students.filter((s) => s.avgScore < 5).length;

  // Comment handlers
  const openCommentDialog = (student: Student) => {
    setEditingStudent(student);
    setNewComment(student.comment);
    setShowCommentDialog(true);
  };

  const handleSaveComment = () => {
    if (!editingStudent) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === editingStudent.id ? { ...s, comment: newComment.trim() } : s
      )
    );
    toast.success("Đã lưu nhận xét", {
      description: `Nhận xét cho ${editingStudent.name} đã được cập nhật.`,
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
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn lớp" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id.toString()}>
                {cls.name}
              </SelectItem>
            ))}
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
            Điểm thang 10 — Tự động từ {completedExams.length} bài thi đã kết thúc
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead className="min-w-[180px]">Học viên</TableHead>
                  {completedExams.map((exam) => (
                    <TableHead key={exam.id} className="text-center min-w-[120px]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="text-xs hover:text-primary transition-colors cursor-pointer underline-offset-2 hover:underline"
                            onClick={() => navigate(`/teacher/exams/results/${exam.id}`)}
                          >
                            {exam.title}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ngày thi: {exam.date}</p>
                          <p className="text-xs text-muted-foreground">Click để xem chi tiết</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                  ))}
                  <TableHead className="text-center">TB</TableHead>
                  <TableHead className="min-w-[200px]">Nhận xét</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => (
                  <TableRow key={student.id} className={student.avgScore < 5 ? "bg-destructive/5" : ""}>
                    <TableCell className="text-center text-muted-foreground text-sm">
                      {index + 1}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>

                    {/* Exam scores — dynamic columns */}
                    {completedExams.map((exam) => {
                      const result = student.examScores.find((es) => es.examId === exam.id);
                      return (
                        <TableCell key={exam.id} className="text-center">
                          {result ? (
                            <span className={`font-semibold ${getScoreColor(result.score)}`}>
                              {result.score.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </TableCell>
                      );
                    })}

                    {/* Average */}
                    <TableCell className="text-center">
                      <span className={`font-bold text-base ${getScoreColor(student.avgScore)}`}>
                        {student.avgScore.toFixed(1)}
                      </span>
                    </TableCell>

                    {/* Comment */}
                    <TableCell>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {student.comment || <span className="italic text-muted-foreground/50">Chưa có nhận xét</span>}
                      </p>
                    </TableCell>

                    {/* Action — edit comment */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openCommentDialog(student)}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
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
                key={exam.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <FileCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{exam.title}</p>
                    <p className="text-xs text-muted-foreground">Ngày thi: {exam.date}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => navigate(`/teacher/exams/results/${exam.id}`)}
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
