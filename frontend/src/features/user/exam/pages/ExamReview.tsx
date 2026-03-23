import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  Loader2,
  BookOpen,
  Eye,
  Lightbulb,
  Target,
  Award,
  Clock,
  BarChart3,
  MinusCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useExamData, useExamResult, useMyAnswers } from "@/features/user/exam/hooks/useExam";
import { formatDateTime } from "@/lib/dateUtils";
import type { ExamAnswerDetail } from "@/features/user/exam/types";

// ── Helpers ──────────────────────────────────────────────────────────────

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const getScoreColor = (score: number, max: number) => {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 60) return "text-blue-600 dark:text-blue-400";
  if (pct >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
};

const getScoreBg = (score: number, max: number) => {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 80) return "bg-emerald-100 dark:bg-emerald-900/30";
  if (pct >= 60) return "bg-blue-100 dark:bg-blue-900/30";
  if (pct >= 40) return "bg-amber-100 dark:bg-amber-900/30";
  return "bg-destructive/10";
};

/**
 * Chuyển selectedAnswer letter ("a","b","c","d") → 0-based index.
 * Trả về -1 nếu không hợp lệ.
 */
function letterToIndex(letter: string | undefined): number {
  if (!letter) return -1;
  const idx = letter.toLowerCase().trim().charCodeAt(0) - 97;
  return idx >= 0 && idx < 26 ? idx : -1;
}

// ── Component ───────────────────────────────────────────────────────────

export function ExamReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get("id") ?? "";

  const { data: examData, isLoading: dataLoading } = useExamData(examId);
  const { data: result, isLoading: resultLoading } = useExamResult(examId);
  const { data: myAnswers = [], isLoading: answersLoading } = useMyAnswers(examId);

  const examInfo = examData?.examInfo;
  const questions = examData?.session?.questions ?? [];
  const totalQuestions = questions.length;
  const isLoading = dataLoading || resultLoading || answersLoading;

  // Build lookup: questionId → ExamAnswerDetail
  const answerMap = new Map<number, ExamAnswerDetail>();
  for (const ans of myAnswers) {
    answerMap.set(ans.questionId, ans);
  }

  // ── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Đang tải bài thi...</p>
        </div>
      </div>
    );
  }

  if (!examInfo || questions.length === 0) {
    return (
      <div className="text-center py-20">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">
          Không tìm thấy bài thi hoặc bài thi chưa có câu hỏi.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/user/exams")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // ── Derived ────────────────────────────────────────────────
  // Essay-aware stats
  const essayAnswers = myAnswers.filter((a) => a.questionType === "essay");
  const pendingEssayCount = essayAnswers.filter((a) => a.essayScore == null).length;
  const hasPendingEssays = pendingEssayCount > 0;

  // MC-only accuracy (exclude ungraded essays from denominator)
  const mcAnswers = myAnswers.filter((a) => a.questionType !== "essay");
  const mcCorrect = mcAnswers.filter((a) => a.isCorrect).length;
  const mcWrong = mcAnswers.length - mcCorrect;
  const mcTotal = mcAnswers.length;

  // Accuracy: only count questions that have been evaluated
  const evaluatedTotal = mcTotal + essayAnswers.filter((a) => a.essayScore != null).length;
  const evaluatedCorrect = mcCorrect + essayAnswers.filter((a) => a.essayScore != null && a.essayScore > 0).length;
  const accuracyPct = evaluatedTotal > 0
    ? Math.round((evaluatedCorrect / evaluatedTotal) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => navigate("/user/exams")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl font-display font-bold text-foreground truncate">
            {examInfo.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {examInfo.className} — Xem lại bài thi
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto flex-shrink-0 gap-1">
          <Eye className="h-3.5 w-3.5" />
          Chế độ xem lại
        </Badge>
      </div>

      {/* ── Score Hero Card ────────────────────────────────── */}
      {result && (
        <Card
          className={`border-2 ${
            result.passed
              ? "border-emerald-200 dark:border-emerald-800"
              : "border-destructive/30"
          }`}
        >
          <CardContent className="py-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center ${getScoreBg(
                  result.score,
                  result.maxScore
                )}`}
              >
                <span
                  className={`text-3xl font-bold ${getScoreColor(
                    result.score,
                    result.maxScore
                  )}`}
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
      )}

      {/* ── Grading Status Banner ─────────────────────────── */}
      {(() => {
        const essayAnswers = myAnswers.filter((a) => a.questionType === "essay");
        const hasEssay = essayAnswers.length > 0;
        const ungradedEssays = essayAnswers.filter((a) => a.essayScore == null);
        if (hasEssay && ungradedEssays.length > 0) {
          return (
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <MinusCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                      Bài thi có {ungradedEssays.length} câu tự luận đang chờ giáo viên chấm điểm
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                      Điểm hiện tại là tạm tính. Điểm chính thức sẽ được cập nhật sau khi giáo viên chấm xong.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        if (hasEssay && ungradedEssays.length === 0) {
          return (
            <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/10">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                      Tất cả câu tự luận đã được chấm điểm
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                      Điểm bên dưới là điểm chính thức bao gồm cả phần tự luận.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        return null;
      })()}

      {/* ── Stats Cards ───────────────────────────────────── */}
      {result && (
        <div className={`grid grid-cols-2 ${hasPendingEssays ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{accuracyPct}%</p>
                  <p className="text-xs text-muted-foreground">
                    Độ chính xác{hasPendingEssays ? " (đã chấm)" : ""}
                  </p>
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
                  <p className="text-xl font-bold text-foreground">{evaluatedCorrect}</p>
                  <p className="text-xs text-muted-foreground">
                    Câu đúng / {evaluatedTotal} đã chấm
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {hasPendingEssays && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{pendingEssayCount}</p>
                    <p className="text-xs text-muted-foreground">Chờ chấm tự luận</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p
                    className={`text-xl font-bold ${getScoreColor(
                      result.score,
                      result.maxScore
                    )}`}
                  >
                    {result.score}/{result.maxScore}{hasPendingEssays ? "*" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hasPendingEssays ? "Điểm tạm tính" : "Điểm số"}
                  </p>
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
      )}

      {/* ── Accuracy Bar ──────────────────────────────────── */}
      {result && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Phân tích kết quả
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Độ chính xác{hasPendingEssays ? " (câu đã chấm)" : ""}
                </span>
                <span className="font-semibold">{accuracyPct}%</span>
              </div>
              {/* Multi-segment progress bar */}
              <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                {evaluatedTotal > 0 && (
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(evaluatedCorrect / result.totalQuestions) * 100}%` }}
                  />
                )}
                {mcWrong > 0 && (
                  <div
                    className="h-full bg-destructive transition-all"
                    style={{ width: `${(mcWrong / result.totalQuestions) * 100}%` }}
                  />
                )}
                {hasPendingEssays && (
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{ width: `${(pendingEssayCount / result.totalQuestions) * 100}%` }}
                  />
                )}
              </div>
            </div>
            <div className={`grid ${hasPendingEssays ? 'grid-cols-3' : 'grid-cols-2'} gap-4 pt-2`}>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Đúng:</span>
                <span className="font-semibold">{evaluatedCorrect}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Sai:</span>
                <span className="font-semibold">{mcWrong}</span>
              </div>
              {hasPendingEssays && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-muted-foreground">Chờ chấm:</span>
                  <span className="font-semibold">{pendingEssayCount}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── All Questions with User Answers ────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Đáp án chi tiết ({totalQuestions} câu)
        </h2>

        {questions.map((q, idx) => {
          const answerDetail = answerMap.get(q.id);
          const isEssay = q.type === "essay";
          const userSelectedIdx = answerDetail ? letterToIndex(answerDetail.selectedAnswer) : -1;
          const correctIdx = answerDetail
            ? letterToIndex(answerDetail.correctAnswer)
            : q.correctIndex;
          const isQuestionCorrect = answerDetail?.isCorrect ?? false;

          return (
            <Card key={q.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isEssay ? (
                      <MinusCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    ) : answerDetail ? (
                      isQuestionCorrect ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )
                    ) : (
                      <MinusCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span>Câu {idx + 1}</span>
                    {isEssay && (
                      <Badge variant="outline" className="text-xs font-normal text-amber-600">Tự luận</Badge>
                    )}
                  </div>
                  {isEssay ? (
                    answerDetail?.essayScore != null ? (
                      <Badge variant="outline" className="text-xs font-normal border-emerald-300 text-emerald-600">
                        Đã chấm: {answerDetail.essayScore}/{answerDetail.maxPoints ?? 1}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs font-normal border-amber-300 text-amber-600">
                        Chờ chấm điểm
                      </Badge>
                    )
                  ) : answerDetail ? (
                    <Badge
                      variant="outline"
                      className={`text-xs font-normal ${
                        isQuestionCorrect
                          ? "border-emerald-300 text-emerald-600"
                          : "border-destructive/50 text-destructive"
                      }`}
                    >
                      {isQuestionCorrect ? "Đúng" : "Sai"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                      Chưa trả lời
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Question text */}
                <p className="text-foreground font-medium leading-relaxed">{q.content}</p>

                {isEssay ? (
                  /* Essay review: show student's text answer + grading result */
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Câu trả lời của bạn:</p>
                    {answerDetail?.selectedAnswer ? (
                      <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{answerDetail.selectedAnswer}</p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg border border-border bg-muted/30">
                        <p className="text-sm text-muted-foreground italic">Chưa trả lời</p>
                      </div>
                    )}

                    {/* Teacher grading result */}
                    {answerDetail?.essayScore != null ? (
                      <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4" />
                            Điểm: {answerDetail.essayScore}/{answerDetail.maxPoints ?? 1}
                          </p>
                          <Badge className="bg-emerald-600 text-[10px]">Đã chấm</Badge>
                        </div>
                        {answerDetail.teacherComment && (
                          <div className="flex items-start gap-2 pt-1">
                            <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-emerald-800 dark:text-emerald-200">
                              {answerDetail.teacherComment}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Câu hỏi tự luận — sẽ được giáo viên chấm điểm sau
                      </p>
                    )}
                  </div>
                ) : (
                  /* MC review: 4-state option display */
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isCorrectOption = correctIdx === optIdx;
                      const isUserSelected = userSelectedIdx === optIdx;

                      let borderClass = "border-border";
                      let bgClass = "";
                      let textClass = "text-foreground";
                      let labelClass = "text-muted-foreground";
                      let badge: React.ReactNode = null;
                      let icon: React.ReactNode = (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/20 flex-shrink-0" />
                      );

                      if (isUserSelected && isCorrectOption) {
                        borderClass = "border-emerald-500";
                        bgClass = "bg-emerald-50 dark:bg-emerald-950/20";
                        textClass = "text-emerald-700 dark:text-emerald-300 font-medium";
                        labelClass = "text-emerald-700 dark:text-emerald-400";
                        icon = <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />;
                        badge = (
                          <Badge className="ml-auto bg-emerald-600 text-[10px] px-2 py-0.5">
                            ✓ Đúng
                          </Badge>
                        );
                      } else if (isUserSelected && !isCorrectOption) {
                        borderClass = "border-destructive";
                        bgClass = "bg-destructive/5";
                        textClass = "text-destructive font-medium";
                        labelClass = "text-destructive";
                        icon = <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />;
                        badge = (
                          <Badge variant="destructive" className="ml-auto text-[10px] px-2 py-0.5">
                            ✗ Bạn đã chọn
                          </Badge>
                        );
                      } else if (isCorrectOption && !isQuestionCorrect) {
                        borderClass = "border-emerald-400 dark:border-emerald-600";
                        bgClass = "bg-emerald-50/50 dark:bg-emerald-950/10";
                        textClass = "text-emerald-700 dark:text-emerald-300 font-medium";
                        labelClass = "text-emerald-700 dark:text-emerald-400";
                        icon = <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />;
                        badge = (
                          <Badge className="ml-auto bg-emerald-500 text-[10px] px-2 py-0.5">
                            → Đáp án đúng
                          </Badge>
                        );
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${borderClass} ${bgClass}`}
                        >
                          {icon}
                          <span className={`font-medium text-sm ${labelClass}`}>
                            {OPTION_LABELS[optIdx]}.
                          </span>
                          <span className={`text-sm ${textClass}`}>{opt}</span>
                          {badge}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-0.5">
                          Giải thích
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Bottom Actions ────────────────────────────────── */}
      <div className="flex gap-3 pb-4">
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
