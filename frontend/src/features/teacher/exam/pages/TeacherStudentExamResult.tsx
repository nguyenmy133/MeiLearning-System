import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  BookOpen,
  Lightbulb,
  Clock,
  Save,
  Loader2,
  MinusCircle,
  Pencil,
} from "lucide-react";

import { useExamDetail, useStudentExamResult, useStudentAnswerDetails, useGradeEssay } from "../hooks";
import { formatDateTime } from "@/lib/dateUtils";
import { toast } from "sonner";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function letterToIndex(letter: string | undefined): number {
  if (!letter) return -1;
  const idx = letter.toLowerCase().trim().charCodeAt(0) - 97;
  return idx >= 0 && idx < 26 ? idx : -1;
}

export function TeacherStudentExamResult() {
  const navigate = useNavigate();
  const { examId, studentId } = useParams<{ examId: string; studentId: string }>();

  const examIdNum = Number(examId);
  const { data: examInfo, isLoading: isLoadingInfo } = useExamDetail(examIdNum);
  const { data: examResult, isLoading: isLoadingResult } = useStudentExamResult(
    examIdNum,
    studentId || ""
  );
  const { data: answerDetails = [], isLoading: isLoadingAnswers } = useStudentAnswerDetails(
    examIdNum,
    studentId || ""
  );
  const gradeMutation = useGradeEssay();

  // Essay grading state: { [answerDetailId]: { score, comment } }
  const [essayGrades, setEssayGrades] = useState<
    Record<number, { score: string; comment: string }>
  >({});
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Count essay questions needing grading
  const essayAnswers = answerDetails.filter((d: any) => d.questionType === "essay");
  const ungradedCount = essayAnswers.filter((d: any) => d.essayScore == null).length;
  const hasEssayQuestions = essayAnswers.length > 0;
  const allEssaysGraded = hasEssayQuestions && ungradedCount === 0;

  // Initialize essay grades from existing data
  if (!hasInitialized && answerDetails.length > 0) {
    const initial: Record<number, { score: string; comment: string }> = {};
    for (const detail of answerDetails) {
      if (detail.questionType === "essay") {
        initial[detail.id] = {
          score: detail.essayScore != null ? String(detail.essayScore) : "",
          comment: detail.teacherComment ?? "",
        };
      }
    }
    setEssayGrades(initial);
    setHasInitialized(true);
    // Auto-open edit mode if there are ungraded essays
    if (ungradedCount > 0) setIsEditMode(true);
  }

  const isLoading = isLoadingInfo || isLoadingResult || isLoadingAnswers;

  // Whether grading form is active (editable)
  const isGradingActive = hasEssayQuestions && (isEditMode || !allEssaysGraded);

  const updateEssayGrade = (detailId: number, field: "score" | "comment", value: string) => {
    setEssayGrades((prev) => ({
      ...prev,
      [detailId]: {
        ...prev[detailId],
        [field]: value,
      },
    }));
  };

  const handleCancelEdit = () => {
    // Reset to original values from server data
    const original: Record<number, { score: string; comment: string }> = {};
    for (const detail of answerDetails) {
      if (detail.questionType === "essay") {
        original[detail.id] = {
          score: detail.essayScore != null ? String(detail.essayScore) : "",
          comment: detail.teacherComment ?? "",
        };
      }
    }
    setEssayGrades(original);
    setIsEditMode(false);
  };

  const handleSaveGrades = () => {
    const grades = Object.entries(essayGrades)
      .filter(([, val]) => val.score !== "")
      .map(([id, val]) => ({
        answerDetailId: Number(id),
        score: Number(val.score),
        comment: val.comment,
      }));

    if (grades.length === 0) return;

    // Validate scores against maxPoints
    for (const grade of grades) {
      const detail = answerDetails.find((d: any) => d.id === grade.answerDetailId);
      const maxPts = detail?.maxPoints ?? 1;
      if (grade.score < 0 || grade.score > maxPts) {
        toast.error(`Điểm phải từ 0 đến ${maxPts}`);
        return;
      }
    }

    gradeMutation.mutate(
      {
        examId: examIdNum,
        studentId: studentId || "",
        grades,
      },
      {
        onSuccess: () => {
          navigate(`/teacher/exams/results/${examId}`);
        },
      }
    );
  };

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

  const score100 = Number(examResult.score ?? 0);
  const score = Math.round((score100 / 10) * 100) / 100; // Convert 0-100 → 0-10
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
                  <p className="text-xs text-muted-foreground">/10</p>
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
                {hasEssayQuestions && ungradedCount > 0 && (
                  <Badge className="ml-2 bg-amber-500 animate-pulse">
                    Cần chấm {ungradedCount} câu tự luận
                  </Badge>
                )}
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
              <span className="font-semibold">{score}/10</span>
            </div>
            <Progress value={score * 10} className="h-2" />
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

      {/* ── Answer Details + Essay Grading ──────────────────────── */}
      {answerDetails.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Chi tiết câu trả lời ({answerDetails.length} câu)
            </h2>
            {hasEssayQuestions && (
              isGradingActive ? (
                <Button
                  onClick={handleSaveGrades}
                  disabled={gradeMutation.isPending}
                  className="gap-2"
                >
                  {gradeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {allEssaysGraded ? "Cập nhật điểm" : "Lưu chấm điểm"}
                </Button>
              ) : allEssaysGraded ? (
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(true)}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Chỉnh sửa
                </Button>
              ) : null
            )}
          </div>

          {answerDetails.map((detail: any, idx: number) => {
            const isEssay = detail.questionType === "essay";
            const userSelectedIdx = letterToIndex(detail.selectedAnswer);
            const correctIdx = letterToIndex(detail.correctAnswer);
            const isQuestionCorrect = detail.isCorrect ?? false;
            const hasBeenGraded = detail.essayScore != null;

            // Parse options from exam questions if available
            const matchingQuestion = examInfo?.questions?.find((q: any) => q.id === detail.questionId);
            let options: string[] = [];
            if (matchingQuestion?.options) {
              try {
                const parsed = typeof matchingQuestion.options === "string"
                  ? JSON.parse(matchingQuestion.options)
                  : matchingQuestion.options;
                if (Array.isArray(parsed)) {
                  options = parsed.map((o: any) =>
                    typeof o === "object" ? o.text ?? o.label ?? String(o.id) : String(o)
                  );
                }
              } catch { /* ignore */ }
            }

            return (
              <Card key={detail.id ?? idx}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isEssay ? (
                        hasBeenGraded ? (
                          detail.essayScore > 0 ? (
                            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                          )
                        ) : (
                          <MinusCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        )
                      ) : isQuestionCorrect ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                      <span>Câu {idx + 1}</span>
                      {isEssay && (
                        <Badge variant="outline" className="text-xs font-normal text-amber-600">
                          Tự luận
                        </Badge>
                      )}
                      {detail.maxPoints && detail.maxPoints > 1 && (
                        <Badge variant="outline" className="text-xs font-normal">
                          {detail.maxPoints} điểm
                        </Badge>
                      )}
                    </div>
                    {isEssay ? (
                      hasBeenGraded ? (
                        <Badge variant="outline" className="text-xs font-normal border-emerald-300 text-emerald-600">
                          Đã chấm: {detail.essayScore}/{detail.maxPoints ?? 1}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs font-normal border-amber-300 text-amber-600 animate-pulse">
                          Chưa chấm
                        </Badge>
                      )
                    ) : (
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
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Question text */}
                  {matchingQuestion && (
                    <p className="text-foreground font-medium leading-relaxed">
                      {matchingQuestion.question ?? ""}
                    </p>
                  )}

                  {isEssay ? (
                    /* Essay: Show student answer + grading form */
                    <div className="space-y-4">
                      {/* Student's answer */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Câu trả lời của học viên:</p>
                        {detail.selectedAnswer ? (
                          <div className="p-4 rounded-lg border border-border bg-muted/30">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {detail.selectedAnswer}
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg border border-border bg-muted/30">
                            <p className="text-sm text-muted-foreground italic">Chưa trả lời</p>
                          </div>
                        )}
                      </div>

                      {/* Grading: read-only or editable */}
                      {isGradingActive ? (
                        /* Editable grading form */
                        <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 space-y-3">
                          <p className="text-sm font-semibold text-primary flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            {hasBeenGraded ? "Chỉnh sửa chấm điểm" : "Chấm điểm"}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">
                                Điểm (0 - {detail.maxPoints ?? 1})
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                max={detail.maxPoints ?? 1}
                                placeholder="Nhập điểm"
                                value={essayGrades[detail.id]?.score ?? ""}
                                onChange={(e) => updateEssayGrade(detail.id, "score", e.target.value)}
                                onBlur={(e) => { if (e.target.value) { const v = String(Number(e.target.value) || 0); updateEssayGrade(detail.id, "score", v); } }}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                              <Label className="text-xs text-muted-foreground">
                                Nhận xét
                              </Label>
                              <Textarea
                                placeholder="Nhập nhận xét cho câu trả lời..."
                                value={essayGrades[detail.id]?.comment ?? ""}
                                onChange={(e) => updateEssayGrade(detail.id, "comment", e.target.value)}
                                rows={3}
                                className="resize-y"
                              />
                            </div>
                          </div>
                        </div>
                      ) : hasBeenGraded ? (
                        /* Read-only grading result */
                        <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle className="h-4 w-4" />
                              Điểm: {detail.essayScore}/{detail.maxPoints ?? 1}
                            </p>
                            <Badge className="bg-emerald-600 text-[10px]">Đã chấm</Badge>
                          </div>
                          {detail.teacherComment && (
                            <div className="flex items-start gap-2 pt-1">
                              <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                                {detail.teacherComment}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    /* MC: Show options with correct/incorrect */
                    options.length > 0 && (
                      <div className="space-y-2">
                        {options.map((opt, optIdx) => {
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
                                ✗ Đã chọn
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
                    )
                  )}

                  {/* Existing teacher comment display */}
                  {detail.teacherComment && !isEssay && (
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-0.5">
                            Nhận xét
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {detail.teacherComment}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Bottom action buttons */}
          {hasEssayQuestions && (
            <div className="flex justify-center gap-3 pt-2">
              {isGradingActive ? (
                /* Editing mode: Save + Cancel */
                <>
                  <Button
                    onClick={handleSaveGrades}
                    disabled={gradeMutation.isPending}
                    size="lg"
                    className="gap-2"
                  >
                    {gradeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {allEssaysGraded ? "Cập nhật điểm" : "Lưu chấm điểm"}
                  </Button>
                  {allEssaysGraded && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleCancelEdit}
                      className="gap-2"
                    >
                      Hủy
                    </Button>
                  )}
                </>
              ) : allEssaysGraded ? (
                /* Read-only mode: Edit button */
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsEditMode(true)}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Chỉnh sửa chấm điểm
                </Button>
              ) : null}
            </div>
          )}
        </div>
      )}

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
