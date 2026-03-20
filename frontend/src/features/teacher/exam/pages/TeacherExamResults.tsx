import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Download,
  Eye,
  Users,
  Target,
  Award,
  BarChart3,
} from "lucide-react";

// useExamInfo đã bị loại bỏ — dùng useExamDetail + useExamStatistics thay thế
import { useExamDetail, useExamStatistics, useStudentResults, useQuestionAnalysis } from "../hooks";

export function TeacherExamResults() {
  const navigate = useNavigate();
  const { examId: idParam } = useParams();
  const examId = Number(idParam);

  // Thay useExamInfo → useExamDetail (gọi GET /exams/{id})
  const { data: examInfo, isLoading: isLoadingInfo } = useExamDetail(examId);
  // Gọi GET /exams/{id}/statistics — đã implement Priority 3
  const { data: statistics, isLoading: isLoadingStats } = useExamStatistics(examId);
  // Gọi GET /exams/{id}/results
  const { data: studentResults = [], isLoading: isLoadingResults } = useStudentResults(examId);
  // Stub endpoint — trả [] không crash
  const { data: questionAnalysis = [], isLoading: isLoadingAnalysis } = useQuestionAnalysis(examId);

  const [filterStatus, setFilterStatus] = useState("all");

  const filteredResults = studentResults.filter((s: any) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "passed") return s.passed;
    if (filterStatus === "failed") return !s.passed;
    return true;
  });

  const isLoading = isLoadingInfo || isLoadingStats || isLoadingResults || isLoadingAnalysis;

  const handleExport = () => {
    alert("Tính năng xuất Excel đang được phát triển");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  // examInfo hoặc statistics chưa load — hiển thị empty state thay vì crash
  if (!examInfo) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Không tìm thấy bài thi.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/teacher/exams")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  // Map từ ExamStatisticsResponse (backend) sang local display
  const statsDisplay = statistics
    ? {
        completedStudents: statistics.totalSubmissions ?? 0,
        totalStudents: statistics.totalSubmissions ?? 0,
        averageScore: statistics.avgScore ?? 0,
        passRate: statistics.passRate ?? 0,
        highestScore: statistics.maxScore ?? 0,
        lowestScore: statistics.minScore ?? 0,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/teacher/exams")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{examInfo.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {examInfo.subject}
            </p>
          </div>
        </div>

        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Xuất Excel
        </Button>
      </div>

      {/* Statistics — chỉ hiển thị khi có data */}
      {statsDisplay && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsDisplay.completedStudents}</p>
                  <p className="text-xs text-muted-foreground">Đã nộp bài</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-500">
                    {statsDisplay.averageScore.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Điểm trung bình</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-500">
                    {statsDisplay.passRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Tỷ lệ đạt</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Cao nhất:{" "}
                    <span className="font-bold text-foreground">
                      {statsDisplay.highestScore}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Thấp nhất:{" "}
                    <span className="font-bold text-foreground">
                      {statsDisplay.lowestScore}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Kết quả học viên</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="passed">Đạt</SelectItem>
                <SelectItem value="failed">Chưa đạt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Chưa có học viên nào nộp bài
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã HV</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead className="text-center">Điểm</TableHead>
                    <TableHead className="text-center">Số câu đúng</TableHead>
                    <TableHead className="text-center">Thời gian (phút)</TableHead>
                    <TableHead className="text-center">Kết quả</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-bold ${
                            student.passed ? "text-emerald-500" : "text-destructive"
                          }`}
                        >
                          {student.score}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {student.correctAnswers}/{examInfo.totalQuestions ?? "?"}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.timeSpent ?? "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            student.passed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-destructive/10 text-destructive"
                          }
                        >
                          {student.passed ? "Đạt" : "Chưa đạt"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/teacher/exams/results/${examInfo.id}/student/${student.studentId}`
                            )
                          }
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Analysis — chỉ hiển thị khi backend có data */}
      {questionAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Phân tích câu hỏi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questionAnalysis.map((q: any) => (
              <div key={q.questionNumber} className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">
                      Câu {q.questionNumber}: {q.question}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={q.correctRate >= 70 ? "default" : "destructive"}>
                        {q.correctRate}% trả lời đúng
                      </Badge>
                    </div>
                  </div>
                </div>

                {q.answerDistribution && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(q.answerDistribution).map(([option, count]: [string, any]) => (
                      <div key={option} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{option.toUpperCase()}</span>
                          <span className="text-muted-foreground">{count} HV</span>
                        </div>
                        <Progress
                          value={
                            statsDisplay
                              ? (Number(count) / statsDisplay.completedStudents) * 100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
