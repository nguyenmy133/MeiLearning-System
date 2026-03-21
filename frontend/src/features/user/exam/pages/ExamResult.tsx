import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  BarChart3,
  ChevronLeft,
  Loader2,
  BookOpen,
  Target,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useExamResult } from "@/features/user/exam/hooks/useExam";
import { formatDateTime } from "@/lib/dateUtils";

// ── Helpers ──────────────────────────────────────────────────────────────

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const getScoreColor = (score: number, max: number) => {
  const pct = (score / max) * 100;
  if (pct >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 60) return "text-blue-600 dark:text-blue-400";
  if (pct >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
};

const getScoreBg = (score: number, max: number) => {
  const pct = (score / max) * 100;
  if (pct >= 80) return "bg-emerald-100 dark:bg-emerald-900/30";
  if (pct >= 60) return "bg-blue-100 dark:bg-blue-900/30";
  if (pct >= 40) return "bg-amber-100 dark:bg-amber-900/30";
  return "bg-destructive/10";
};

// ── Component ───────────────────────────────────────────────────────────

export function ExamResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get("id") ?? "";

  const { data: result, isLoading, isError } = useExamResult(examId);

  // ── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-60" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // ── Error / Not found ──────────────────────────────────────
  if (isError || !result) {
    return (
      <div className="text-center py-20 space-y-4">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">
          Không tìm thấy kết quả bài thi. Có thể bạn chưa nộp bài.
        </p>
        <Button variant="outline" onClick={() => navigate("/user/exams")}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────
  const accuracyPct =
    result.totalQuestions > 0
      ? Math.round((result.correctCount / result.totalQuestions) * 100)
      : 0;

  const scorePct =
    result.maxScore > 0
      ? Math.round((result.score / result.maxScore) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => navigate("/user/exams")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl lg:text-2xl font-display font-bold text-foreground">
            {result.examTitle}
          </h1>
          <p className="text-sm text-muted-foreground">{result.className}</p>
        </div>
      </div>

      {/* Score hero card */}
      <Card className={`border-2 ${result.passed ? "border-emerald-200 dark:border-emerald-800" : "border-destructive/30"}`}>
        <CardContent className="py-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center ${getScoreBg(result.score, result.maxScore)}`}
            >
              <span
                className={`text-3xl font-bold ${getScoreColor(result.score, result.maxScore)}`}
              >
                {result.score}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Trên thang điểm {result.maxScore}
              </p>
              <Badge
                variant={result.passed ? "default" : "destructive"}
                className="mt-2 text-sm px-4"
              >
                {result.passed ? (
                  <>
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Đạt
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Không đạt
                  </>
                )}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{accuracyPct}%</p>
                <p className="text-xs text-muted-foreground">Độ chính xác</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{result.correctCount}</p>
                <p className="text-xs text-muted-foreground">Câu đúng / {result.totalQuestions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className={`text-xl font-bold ${getScoreColor(result.score, result.maxScore)}`}>
                  {result.score}/{result.maxScore}
                </p>
                <p className="text-xs text-muted-foreground">Điểm số</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">
                  {formatDateTime(result.submittedAt)}
                </p>
                <p className="text-xs text-muted-foreground">Thời gian nộp</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accuracy progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Phân tích kết quả
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Độ chính xác</span>
              <span className="font-semibold">{accuracyPct}%</span>
            </div>
            <Progress value={accuracyPct} className="h-3" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Đúng:</span>
              <span className="font-semibold">{result.correctCount}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Sai:</span>
              <span className="font-semibold">
                {result.totalQuestions - result.correctCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown - if available */}
      {result.breakdown && result.breakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Chi tiết từng câu
            </CardTitle>
            <CardDescription>
              Kết quả trả lời cho từng câu hỏi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.breakdown.map((item, index) => (
                <div
                  key={item.questionId}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.correct
                      ? "bg-emerald-50 dark:bg-emerald-950/20"
                      : "bg-destructive/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.correct ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">Câu {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Đã chọn:{" "}
                      <span className={item.correct ? "font-semibold text-emerald-600" : "font-semibold text-destructive"}>
                        {OPTION_LABELS[item.selectedOption] ?? "—"}
                      </span>
                    </span>
                    {!item.correct && (
                      <span className="text-muted-foreground">
                        Đáp án:{" "}
                        <span className="font-semibold text-emerald-600">
                          {OPTION_LABELS[item.correctOption] ?? "—"}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/user/exams")} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" /> Quay lại danh sách
        </Button>
        <Button variant="outline" onClick={() => navigate("/user/grades")} className="gap-1.5">
          <Award className="h-4 w-4" /> Xem kết quả học tập
        </Button>
      </div>
    </div>
  );
}
