import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Target,
  User,
  Download,
} from "lucide-react";

// useExamInfo đã xóa → dùng useExamDetail (GET /exams/{id})
import { useExamDetail, useStudentExamResult } from "../hooks";
import { formatDateTime } from "@/lib/dateUtils";

export function TeacherStudentExamResult() {
  const navigate = useNavigate();
  const { examId, studentId } = useParams<{ examId: string; studentId: string }>();

  const examIdNum = Number(examId);
  const { data: examInfo, isLoading: isLoadingInfo } = useExamDetail(examIdNum);
  const { data: examResult, isLoading: isLoadingResult } = useStudentExamResult(
    examIdNum,
    studentId || ""
  );

  const isLoading = isLoadingInfo || isLoadingResult;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-6">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-[200px]" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  // Graceful empty state — không có data thì không crash
  if (!examResult) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-muted-foreground">Không tìm thấy kết quả của học viên này.</p>
        <Button variant="outline" onClick={() => navigate(`/teacher/exams/results/${examId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách kết quả
        </Button>
      </div>
    );
  }

  // Map từ ExamResultResponse backend:
  // { id, examId, examTitle, studentId, studentName, score, correctAnswers, timeSpent, passed, submittedAt }
  const score = Number(examResult.score ?? 0);
  const correctAnswers = examResult.correctAnswers ?? 0;
  const totalQuestions = examInfo?.totalQuestions ?? 0;
  const isPassed = examResult.passed ?? false;
  const accuracyRate = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/teacher/exams/results/${examId}`)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1 text-primary border-primary">
              <User className="w-3 h-3" />
              Chế độ giáo viên
            </Badge>
            <span className="text-sm text-muted-foreground">
              Kết quả của học viên{" "}
              <span className="font-semibold text-foreground">
                {examResult.studentName}
              </span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground mt-1">
            {examResult.examTitle ?? examInfo?.title ?? "Bài thi"}
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => alert("Tính năng tải kết quả đang được phát triển")}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Xuất kết quả
        </Button>
      </div>

      {/* Result Hero Card */}
      <Card
        className={`border-2 ${
          isPassed ? "border-emerald-500 bg-emerald-500/5" : "border-amber-500 bg-amber-500/5"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Score Circle */}
            <div className="relative">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center border-8 ${
                  isPassed
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-amber-500 bg-amber-500/10"
                }`}
              >
                <div className="text-center">
                  <p
                    className={`text-4xl font-bold ${
                      isPassed ? "text-emerald-500" : "text-amber-500"
                    }`}
                  >
                    {score}
                  </p>
                  <p className="text-xs text-muted-foreground">/100</p>
                </div>
              </div>
              {isPassed && (
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left space-y-3">
              <div>
                <Badge
                  className={`mb-2 ${isPassed ? "bg-emerald-500" : "bg-amber-500"}`}
                >
                  {isPassed ? "ĐẠT" : "CHƯA ĐẠT"}
                </Badge>
                <h2 className="text-xl font-bold text-foreground">
                  {examResult.examTitle ?? examInfo?.title}
                </h2>
                {examInfo?.subject && (
                  <p className="text-muted-foreground mt-1">{examInfo.subject}</p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Số câu đúng</p>
                  <p className="text-lg font-bold text-emerald-500">
                    {correctAnswers}{totalQuestions > 0 ? `/${totalQuestions}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Độ chính xác</p>
                  <p className="text-lg font-bold text-foreground">
                    {accuracyRate.toFixed(1)}%
                  </p>
                </div>
                {examResult.timeSpent != null && (
                  <div>
                    <p className="text-muted-foreground">Thời gian</p>
                    <p className="text-lg font-bold text-foreground">
                      {examResult.timeSpent} phút
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-500">{correctAnswers}</p>
                <p className="text-xs text-muted-foreground">Câu đúng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {totalQuestions > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">
                    {totalQuestions - correctAnswers}
                  </p>
                  <p className="text-xs text-muted-foreground">Câu sai</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {accuracyRate.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Độ chính xác</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Phân tích kết quả
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Điểm số</span>
              <span className="font-semibold">{score}/100</span>
            </div>
            <Progress value={score} className="h-2" />
          </div>

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p>
              Nộp lúc:{" "}
              <span className="font-medium text-foreground">
                {examResult.submittedAt
                  ? formatDateTime(examResult.submittedAt)
                  : "—"}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => navigate(`/teacher/exams/results/${examId}`)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Về danh sách kết quả
        </Button>
        <Button variant="default" onClick={() => navigate("/teacher/dashboard")} className="gap-2">
          <Award className="w-4 h-4" />
          Về Dashboard
        </Button>
      </div>
    </div>
  );
}
