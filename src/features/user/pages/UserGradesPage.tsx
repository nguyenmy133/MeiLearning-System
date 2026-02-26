import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  MessageSquare,
  BarChart3,
  Star,
  Eye,
  FileCheck,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ── Mock data ────────────────────────────────────────────────────────────
// This user = "Nguyễn Minh Anh" — scores come from exam results (auto-graded)
// Consistent with TeacherGradesPage & TeacherExamManagement mock data

interface ExamScore {
  examId: number;
  examTitle: string;      // Tên bài thi = tên cột điểm
  score: number;           // Thang 10
  passed: boolean;
  date: string;
}

interface SubjectGrade {
  id: number;
  className: string;
  subjectName: string;
  teacher: string;
  teacherAvatar: string;
  examScores: ExamScore[];
  avgScore: number;
  trend: "up" | "down" | "stable";
  comment: string;             // Nhận xét từ GV
  rank: number;
  totalStudents: number;
  semester: string;
}

const gradesData: SubjectGrade[] = [
  {
    id: 1,
    className: "Toán 10A",
    subjectName: "Toán học",
    teacher: "Thầy Nguyễn Văn An",
    teacherAvatar: "",
    examScores: [
      { examId: 1, examTitle: "Kiểm tra giữa kỳ - Toán 12", score: 8.5, passed: true, date: "20/01/2024" },
      { examId: 2, examTitle: "Bài tập tuần 3 - Đạo hàm", score: 9.0, passed: true, date: "29/01/2024" },
    ],
    avgScore: 8.8,
    trend: "up",
    comment: "Học tập chăm chỉ, tiến bộ tốt trong các bài kiểm tra.",
    rank: 3,
    totalStudents: 32,
    semester: "HK1 2024-2025",
  },
  {
    id: 2,
    className: "Lý 10A",
    subjectName: "Vật lý",
    teacher: "Cô Trần Thị Mai",
    teacherAvatar: "",
    examScores: [
      { examId: 10, examTitle: "KT chương 1 - Cơ học", score: 7.5, passed: true, date: "08/10/2024" },
      { examId: 11, examTitle: "Kiểm tra giữa kỳ - Lý 10", score: 7.0, passed: true, date: "28/11/2024" },
    ],
    avgScore: 7.3,
    trend: "stable",
    comment: "Ổn định, cần cải thiện phần cơ học.",
    rank: 8,
    totalStudents: 30,
    semester: "HK1 2024-2025",
  },
  {
    id: 3,
    className: "Hóa 10A",
    subjectName: "Hóa học",
    teacher: "Cô Lê Thị Hương",
    teacherAvatar: "",
    examScores: [
      { examId: 20, examTitle: "KT 15 phút - Oxi hóa khử", score: 9.0, passed: true, date: "06/10/2024" },
      { examId: 21, examTitle: "KT giữa kỳ - Hóa 10", score: 9.5, passed: true, date: "22/11/2024" },
    ],
    avgScore: 9.3,
    trend: "up",
    comment: "Xuất sắc! Một trong những học viên giỏi nhất lớp.",
    rank: 1,
    totalStudents: 28,
    semester: "HK1 2024-2025",
  },
  {
    id: 4,
    className: "Anh Văn B1",
    subjectName: "Tiếng Anh",
    teacher: "Thầy Trần Văn Hùng",
    teacherAvatar: "",
    examScores: [
      { examId: 30, examTitle: "Reading Test Unit 1-3", score: 6.5, passed: true, date: "10/10/2024" },
      { examId: 31, examTitle: "Listening Midterm", score: 7.0, passed: true, date: "25/10/2024" },
      { examId: 32, examTitle: "Grammar Quiz Week 8", score: 7.5, passed: true, date: "15/11/2024" },
    ],
    avgScore: 7.0,
    trend: "up",
    comment: "Đang tiến bộ, cần luyện tập thêm kỹ năng nghe.",
    rank: 10,
    totalStudents: 15,
    semester: "HK1 2024-2025",
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
  if (score >= 5) return "Trung bình";
  return "Yếu";
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up": return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    case "down": return <TrendingDown className="w-4 h-4 text-destructive" />;
    default: return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
};

const getTrendLabel = (trend: string) => {
  switch (trend) {
    case "up": return "Tiến bộ";
    case "down": return "Giảm sút";
    default: return "Ổn định";
  }
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase();

// ── Component ───────────────────────────────────────────────────────────

export function UserGradesPage() {
  const navigate = useNavigate();
  const [selectedSemester, setSelectedSemester] = useState("HK1 2024-2025");

  // Overall statistics
  const overallAvg = gradesData.reduce((sum, g) => sum + g.avgScore, 0) / gradesData.length;
  const bestSubject = gradesData.reduce((best, g) => (g.avgScore > best.avgScore ? g : best));
  const improvingCount = gradesData.filter((g) => g.trend === "up").length;
  const totalExams = gradesData.reduce((sum, g) => sum + g.examScores.length, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
            Kết quả học tập
          </h1>
          <p className="text-muted-foreground mt-1">
            Tổng hợp điểm từ bài thi, nhận xét và xếp hạng từ giáo viên
          </p>
        </div>
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-[200px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HK1 2024-2025">HK1 2024-2025</SelectItem>
            <SelectItem value="HK2 2023-2024">HK2 2023-2024</SelectItem>
            <SelectItem value="HK1 2023-2024">HK1 2023-2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Info banner */}
      <Card className="border-blue-200/50 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 text-sm">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-blue-700 dark:text-blue-300">
              Điểm được tính tự động từ kết quả các bài thi trực tuyến. Xem chi tiết từng bài thi tại mục{" "}
              <button
                onClick={() => navigate("/user/exams")}
                className="font-medium underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-100"
              >
                Bài thi
              </button>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${getScoreBg(overallAvg)}`}>
                <Award className={`h-6 w-6 ${getScoreColor(overallAvg)}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${getScoreColor(overallAvg)}`}>
                  {overallAvg.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Điểm TB tổng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalExams}</p>
                <p className="text-xs text-muted-foreground">Bài thi đã làm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Star className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{bestSubject.subjectName}</p>
                <p className="text-xs text-muted-foreground">Môn giỏi nhất ({bestSubject.avgScore})</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{improvingCount}/{gradesData.length}</p>
                <p className="text-xs text-muted-foreground">Môn tiến bộ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {gradesData.map((subject) => (
          <Card key={subject.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getScoreBg(subject.avgScore)}`}>
                    <span className={`text-lg font-bold ${getScoreColor(subject.avgScore)}`}>
                      {subject.avgScore.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-base">{subject.subjectName}</CardTitle>
                    <CardDescription>{subject.className}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {getTrendIcon(subject.trend)}
                  <span className="text-xs text-muted-foreground">{getTrendLabel(subject.trend)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Teacher */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={subject.teacherAvatar} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {getInitials(subject.teacher)}
                  </AvatarFallback>
                </Avatar>
                <span>{subject.teacher}</span>
              </div>

              {/* Exam Scores — dynamic from bài thi */}
              <div className="space-y-2">
                {subject.examScores.map((es) => (
                  <div
                    key={es.examId}
                    className="flex items-center justify-between p-2.5 bg-secondary/50 rounded-md hover:bg-secondary transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{es.examTitle}</p>
                      <p className="text-[11px] text-muted-foreground">{es.date}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-sm font-bold ${getScoreColor(es.score)}`}>
                        {es.score.toFixed(1)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => navigate(`/user/exam-result?id=${es.examId}`)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rank */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <Badge variant="outline" className={`text-xs ${getScoreColor(subject.avgScore)}`}>
                  {getScoreLabel(subject.avgScore)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Xếp hạng: <span className="font-semibold text-foreground">{subject.rank}/{subject.totalStudents}</span>
                </span>
              </div>

              {/* Teacher Comment */}
              {subject.comment && (
                <div className="p-2.5 bg-primary/5 border border-primary/10 rounded-md">
                  <div className="flex items-start gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Nhận xét từ {subject.teacher}:</p>
                      <p className="text-foreground">{subject.comment}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Table — columns = exam titles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Bảng điểm chi tiết
          </CardTitle>
          <CardDescription>Điểm thang 10 — Tự động từ kết quả bài thi trực tuyến</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Giáo viên</TableHead>
                  <TableHead className="text-center">Bài thi</TableHead>
                  <TableHead className="text-center">TB</TableHead>
                  <TableHead className="text-center">Xếp hạng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradesData.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{subject.subjectName}</p>
                        <p className="text-xs text-muted-foreground">{subject.className}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{subject.teacher}</span>
                    </TableCell>

                    {/* Exam scores inline */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {subject.examScores.map((es) => (
                          <Badge
                            key={es.examId}
                            variant="secondary"
                            className={`text-xs cursor-pointer hover:opacity-80 transition-opacity ${getScoreColor(es.score)}`}
                            onClick={() => navigate(`/user/exam-result?id=${es.examId}`)}
                          >
                            {es.examTitle.length > 20 ? es.examTitle.substring(0, 18) + "..." : es.examTitle}: {es.score.toFixed(1)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className={`font-bold text-base ${getScoreColor(subject.avgScore)}`}>
                        {subject.avgScore.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {subject.rank}/{subject.totalStudents}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Overall Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Tổng kết học kỳ {selectedSemester}</p>
              <div className="mt-2 text-muted-foreground space-y-1">
                <p>
                  • Điểm trung bình tổng: <span className={`font-bold ${getScoreColor(overallAvg)}`}>{overallAvg.toFixed(1)}</span>
                  {" — "}
                  <Badge variant="outline" className={`text-xs ${getScoreColor(overallAvg)}`}>
                    {getScoreLabel(overallAvg)}
                  </Badge>
                </p>
                <p>• Tổng bài thi đã làm: {totalExams}</p>
                <p>• Số môn tiến bộ: {improvingCount}/{gradesData.length}</p>
                <p>• Môn giỏi nhất: {bestSubject.subjectName} ({bestSubject.avgScore})</p>
                <p>• Xếp hạng cao nhất: {bestSubject.rank}/{bestSubject.totalStudents} (lớp {bestSubject.className})</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
