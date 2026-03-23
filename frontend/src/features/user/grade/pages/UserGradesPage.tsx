import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  BookOpen,
  Calendar,
  MessageSquare,
  BarChart3,
  Star,
  Eye,
  FileCheck,
  Info,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useMyGrades } from "@/features/user/grade/hooks";
import { formatDate, formatDateTime } from "@/lib/dateUtils";

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



const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase();



// ── Component ───────────────────────────────────────────────────────────

export function UserGradesPage() {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "completed">("all");

  const { data: allGrades = [], isLoading } = useMyGrades();

  // Filter by class status
  const gradesData = selectedStatus === "all"
    ? allGrades
    : allGrades.filter((g) => g.classStatus === selectedStatus);

  // Overall statistics
  const totalExams = gradesData.reduce((sum, g) => sum + g.examScores.length, 0);
  const passedExams = gradesData.reduce((sum, g) => sum + g.examScores.filter((e) => e.passed).length, 0);
  const excellentExams = gradesData.reduce((sum, g) => sum + g.examScores.filter((e) => e.score >= 8).length, 0);
  const needsAttention = gradesData.filter((g) => g.avgScore < 6.5).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-display font-bold">Kết quả học tập</h1></div>
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

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
        <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as any)}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả lớp</SelectItem>
            <SelectItem value="active">Đang học</SelectItem>
            <SelectItem value="completed">Đã hoàn thành</SelectItem>
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
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalExams}</p>
                <p className="text-xs text-muted-foreground">Tổng bài thi đã làm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Tỷ lệ bài thi đạt ({passedExams}/{totalExams})</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Star className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{excellentExams}</p>
                <p className="text-xs text-muted-foreground">Bài thi xuất sắc (≥ 8 điểm)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-destructive/10 rounded-lg">
                <Target className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{needsAttention}</p>
                <p className="text-xs text-muted-foreground">Môn cần chú ý (Điểm TB &lt; 6.5)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Cards */}
      {gradesData.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Chưa có dữ liệu điểm.</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {gradesData.map((subject) => (
              <Card key={subject.classId} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getScoreBg(subject.avgScore)}`}>
                        <span className={`text-lg font-bold ${getScoreColor(subject.avgScore)}`}>
                          {subject.avgScore.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-base">{subject.subject}</CardTitle>
                        <CardDescription>{subject.className}</CardDescription>
                      </div>
                    </div>
                    {subject.classStatus === "completed" && (
                      <Badge variant="secondary" className="text-[10px]">Hoàn thành</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Teacher */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {getInitials(subject.teacherName)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{subject.teacherName}</span>
                  </div>

                  {/* Exam Scores */}
                  <div className="space-y-2">
                    {subject.examScores.map((es) => (
                      <div
                        key={es.examId}
                        className="flex items-center justify-between p-2.5 bg-secondary/50 rounded-md hover:bg-secondary transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium truncate">{es.examTitle}</p>
                            {es.gradingStatus === "pending" && (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-400 text-amber-600 dark:text-amber-400 animate-pulse whitespace-nowrap">
                                ⏳ Chờ chấm tự luận
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Nộp bài: {formatDateTime(es.submittedAt || es.date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className={`text-sm font-bold leading-none ${getScoreColor(es.score)}`}>
                              {es.score.toFixed(1)}{es.gradingStatus === "pending" ? "*" : ""}
                            </span>
                          </div>
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
                    {subject.examScores.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-3">Chưa có bài thi nào.</p>
                    )}
                  </div>

                  {/* Score label */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getScoreColor(subject.avgScore)}`}>
                        {getScoreLabel(subject.avgScore)}
                      </Badge>
                    </div>
                  </div>

                  {/* Teacher Comment */}
                  {subject.teacherComment && (
                    <div className="p-2.5 bg-primary/5 border border-primary/10 rounded-md">
                      <div className="flex items-start gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Nhận xét từ {subject.teacherName}:</p>
                          <p className="text-foreground">{subject.teacherComment}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>



        </>
      )}
    </div>
  );
}
