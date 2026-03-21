import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  AlertTriangle,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useStartExam, useExamSession, useSubmitExam } from "@/features/user/exam/hooks/useExam";
import type { ExamQuestion } from "@/features/user/exam/types";

// ── Helpers ──────────────────────────────────────────────────────────────

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// ── Component ───────────────────────────────────────────────────────────

export function ExamTaking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get("id") ?? "";

  // ── API hooks ──────────────────────────────────────────────
  const { data: examInfo, isLoading: infoLoading } = useStartExam(examId);
  const { data: session, isLoading: sessionLoading } = useExamSession(examId);
  const submitMutation = useSubmitExam();

  // ── State ──────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const autoSubmitRef = useRef(false);

  const questions: ExamQuestion[] = session?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (session?.remainingSeconds && timeLeft === null) {
      setTimeLeft(session.remainingSeconds);
    }
  }, [session, timeLeft]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // ── Auto-submit when time runs out ─────────────────────────
  const handleSubmit = useCallback(() => {
    if (submitted || !examId) return;
    setSubmitted(true);

    submitMutation.mutate(
      { examId, answers },
      {
        onSuccess: (result) => {
          navigate(`/user/exam-result?id=${examId}`, { replace: true });
        },
        onError: () => {
          setSubmitted(false);
        },
      }
    );
  }, [examId, answers, submitted, submitMutation, navigate]);

  useEffect(() => {
    if (timeLeft === 0 && !autoSubmitRef.current) {
      autoSubmitRef.current = true;
      handleSubmit();
    }
  }, [timeLeft, handleSubmit]);

  // ── Handlers ───────────────────────────────────────────────
  const selectAnswer = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const toggleFlag = (questionId: number) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(questionId) ? next.delete(questionId) : next.add(questionId);
      return next;
    });
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) setCurrentIndex(index);
  };

  // ── Loading ────────────────────────────────────────────────
  if (infoLoading || sessionLoading) {
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
        <p className="text-muted-foreground">Không tìm thấy bài thi hoặc bài thi chưa có câu hỏi.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/user/exams")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // ── Timer urgency ──────────────────────────────────────────
  const timeUrgent = timeLeft !== null && timeLeft < 60;
  const timeWarning = timeLeft !== null && timeLeft < 300 && !timeUrgent;
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
        <div className="flex items-center gap-3 min-w-0">
          <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="font-semibold text-foreground truncate">{examInfo.title}</h1>
            <p className="text-xs text-muted-foreground">{examInfo.className}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Timer */}
          {timeLeft !== null && (
            <Badge
              variant={timeUrgent ? "destructive" : timeWarning ? "secondary" : "outline"}
              className={`text-sm font-mono gap-1.5 ${timeUrgent ? "animate-pulse" : ""}`}
            >
              <Clock className="h-3.5 w-3.5" />
              {formatTime(timeLeft)}
            </Badge>
          )}

          {/* Progress */}
          <Badge variant="outline" className="text-sm gap-1.5">
            {answeredCount}/{totalQuestions}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progressPct} className="h-1.5" />

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Main — Question area */}
        <div className="lg:col-span-3 space-y-4">
          {currentQuestion && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Câu {currentIndex + 1}/{totalQuestions}
                  </CardTitle>
                  <Button
                    variant={flagged.has(currentQuestion.id) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className="gap-1.5"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    {flagged.has(currentQuestion.id) ? "Đã đánh dấu" : "Đánh dấu"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Question text */}
                <p className="text-foreground font-medium leading-relaxed">
                  {currentQuestion.content}
                </p>

                {/* Options */}
                <RadioGroup
                  value={answers[currentQuestion.id]?.toString() ?? ""}
                  onValueChange={(val) => selectAnswer(currentQuestion.id, parseInt(val))}
                >
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((opt, idx) => (
                      <Label
                        key={idx}
                        htmlFor={`opt-${currentQuestion.id}-${idx}`}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          answers[currentQuestion.id] === idx
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border hover:bg-secondary/50"
                        }`}
                      >
                        <RadioGroupItem
                          value={idx.toString()}
                          id={`opt-${currentQuestion.id}-${idx}`}
                        />
                        <span className="font-medium text-primary mr-1">
                          {OPTION_LABELS[idx]}.
                        </span>
                        <span className="text-foreground">{opt}</span>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => goToQuestion(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" /> Câu trước
            </Button>

            {currentIndex < totalQuestions - 1 ? (
              <Button onClick={() => goToQuestion(currentIndex + 1)} className="gap-1.5">
                Câu sau <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                disabled={submitted}
              >
                <Send className="h-4 w-4" /> Nộp bài
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar — Question map */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Bản đồ câu hỏi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isFlagged = flagged.has(q.id);
                  const isCurrent = idx === currentIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(idx)}
                      className={`
                        h-8 rounded text-xs font-medium transition-all relative
                        ${isCurrent ? "ring-2 ring-primary ring-offset-1" : ""}
                        ${isAnswered
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }
                      `}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-primary" />
                  Đã trả lời ({answeredCount})
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-secondary" />
                  Chưa trả lời ({totalQuestions - answeredCount})
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-secondary relative">
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full" />
                  </span>
                  Đã đánh dấu ({flagged.size})
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick submit button on sidebar */}
          <Button
            className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setShowSubmitDialog(true)}
            disabled={submitted}
          >
            <Send className="h-4 w-4" /> Nộp bài
          </Button>

          <Button
            variant="ghost"
            className="w-full text-destructive hover:text-destructive"
            onClick={() => setShowExitDialog(true)}
          >
            Thoát bài thi
          </Button>
        </div>
      </div>

      {/* ── Submit confirmation dialog ── */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận nộp bài</DialogTitle>
            <DialogDescription>
              Bạn đã trả lời {answeredCount}/{totalQuestions} câu hỏi.
              {totalQuestions - answeredCount > 0 && (
                <span className="text-amber-600 font-medium">
                  {" "}Còn {totalQuestions - answeredCount} câu chưa trả lời!
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Tiếp tục làm bài
            </Button>
            <Button
              onClick={() => {
                setShowSubmitDialog(false);
                handleSubmit();
              }}
              disabled={submitted || submitMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Nộp bài
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Exit confirmation dialog ── */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Thoát bài thi
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn thoát? Bài thi sẽ không được nộp và bạn có
              thể mất dữ liệu đã làm.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Ở lại
            </Button>
            <Button
              variant="destructive"
              onClick={() => navigate("/user/exams")}
            >
              Thoát
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
