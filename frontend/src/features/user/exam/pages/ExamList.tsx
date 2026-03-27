import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "@/lib/dateUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Trophy,
  Calendar,
  Eye,
  AlertTriangle,
  Hourglass,
} from "lucide-react";
import { useMyExams } from "@/features/user/exam/hooks";
import type { ExamDetail } from "@/features/user/exam/types";
import { toast } from "sonner";

/** Check if user has already started this exam (timer exists in localStorage) */
function hasExamStarted(examId: string): boolean {
  return localStorage.getItem(`exam_timer_${examId}`) !== null;
}

export function ExamList() {
  const navigate = useNavigate();
  const { data: exams = [], isLoading } = useMyExams();
  const [confirmExam, setConfirmExam] = useState<ExamDetail | null>(null);

  const upcomingExams = exams.filter((e) => e.status === "upcoming");
  const ongoingExams = exams.filter((e) => e.status === "ongoing");
  const completedExams = exams.filter((e) => e.status === "completed");
  const missedExams = exams.filter((e) => e.status === "missed");
  const pendingGradingCount = completedExams.filter((e) => e.myGradingStatus === "pending").length;

  // "Cần làm" = ongoing + upcoming, sorted by endAt (nearest first)
  const todoExams = [...ongoingExams, ...upcomingExams].sort((a, b) => {
    const aTime = a.endAt ? new Date(a.endAt).getTime() : Infinity;
    const bTime = b.endAt ? new Date(b.endAt).getTime() : Infinity;
    return aTime - bTime;
  });

  // Determine default tab
  const defaultTab = todoExams.length > 0 ? "todo" : completedExams.length > 0 ? "completed" : "missed";

  const getStatusBadge = (exam: ExamDetail) => {
    switch (exam.status) {
      case "upcoming":
        return <Badge className="bg-blue-500">Chưa tới giờ</Badge>;
      case "ongoing":
        return <Badge className="bg-warning">Đang diễn ra</Badge>;
      case "completed":
        return <Badge className="bg-success">Hoàn thành</Badge>;
      case "missed":
        return <Badge variant="destructive">Đã quá hạn</Badge>;
    }
  };

  const handleStartExam = (exam: ExamDetail) => {
    // Guard: không cho bắt đầu trước thời gian mở
    if (exam.startAt && new Date(exam.startAt) > new Date()) {
      toast.error("Bài thi chưa tới giờ mở. Vui lòng quay lại sau.");
      return;
    }
    setConfirmExam(exam);
  };

  const handleConfirmStart = () => {
    if (!confirmExam) return;
    // Lưu thời gian bắt đầu vào localStorage (nếu chưa có)
    const timerKey = `exam_timer_${confirmExam.id}`;
    if (!localStorage.getItem(timerKey)) {
      localStorage.setItem(
        timerKey,
        JSON.stringify({
          startedAt: Date.now(),
          durationMs: confirmExam.durationMinutes * 60 * 1000,
        })
      );
    }
    setConfirmExam(null);
    navigate(`/user/exam-taking?id=${confirmExam.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Bài thi trực tuyến</h1>
          <p className="text-muted-foreground mt-1">Danh sách bài thi và kết quả</p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Bài thi trực tuyến
        </h1>
        <p className="text-muted-foreground mt-1">Danh sách bài thi và kết quả</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{exams.length}</p>
                <p className="text-xs text-muted-foreground">Tổng bài thi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{completedExams.length}</p>
                <p className="text-xs text-muted-foreground">Đã hoàn thành</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{todoExams.length}</p>
                <p className="text-xs text-muted-foreground">Cần làm</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Hourglass className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{pendingGradingCount}</p>
                <p className="text-xs text-muted-foreground">Chờ chấm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tab Navigation ───────────────────────────────────── */}
      {exams.length > 0 ? (
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="todo" className="gap-1.5 flex-1 sm:flex-initial">
              <Play className="w-3.5 h-3.5" />
              Cần làm
              {todoExams.length > 0 && (
                <Badge className="ml-1 h-5 px-1.5 text-[10px] bg-warning/80">{todoExams.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1.5 flex-1 sm:flex-initial">
              <CheckCircle className="w-3.5 h-3.5" />
              Hoàn thành
              {completedExams.length > 0 && (
                <Badge className="ml-1 h-5 px-1.5 text-[10px] bg-success/80">{completedExams.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="missed" className="gap-1.5 flex-1 sm:flex-initial">
              <XCircle className="w-3.5 h-3.5" />
              Quá hạn
              {missedExams.length > 0 && (
                <Badge className="ml-1 h-5 px-1.5 text-[10px] bg-destructive/80">{missedExams.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: Cần làm ─────────────────────────────────── */}
          <TabsContent value="todo" className="space-y-4">
            {todoExams.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Không có bài thi nào cần làm</p>
                <p className="text-sm mt-1">Tuyệt vời! Bạn đã hoàn thành tất cả 🎉</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {todoExams.map((exam) => {
                  const isOngoing = exam.status === "ongoing";
                  return (
                    <Card
                      key={exam.id}
                      className={`transition-shadow ${
                        isOngoing
                          ? "hover:shadow-lg border-warning/30"
                          : "opacity-80"
                      }`}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-lg text-foreground">{exam.title}</h3>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge variant="secondary">{exam.className}</Badge>
                                  {getStatusBadge(exam)}
                                </div>
                                {exam.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{exam.description}</p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{exam.durationMinutes} phút</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <FileText className="w-4 h-4" />
                                <span>{exam.totalQuestions} câu</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>Mở: {formatDateTime(exam.startAt)}</span>
                              </div>
                              {exam.endAt && (
                                <div className="flex items-center gap-2 text-destructive font-medium">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>Hạn: {formatDateTime(exam.endAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {isOngoing ? (
                            hasExamStarted(exam.id) ? (
                              <Button className="gap-2 bg-amber-600 hover:bg-amber-700" onClick={() => handleStartExam(exam)}>
                                <RotateCcw className="w-4 h-4" />
                                Tiếp tục làm bài
                              </Button>
                            ) : (
                              <Button className="gap-2" onClick={() => handleStartExam(exam)}>
                                <Play className="w-4 h-4" />
                                Bắt đầu làm bài
                              </Button>
                            )
                          ) : (
                            <Button className="gap-2" disabled>
                              <Clock className="w-4 h-4" />
                              Chưa tới giờ
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Hoàn thành ───────────────────────────────── */}
          <TabsContent value="completed" className="space-y-4">
            {completedExams.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Chưa hoàn thành bài thi nào</p>
                <p className="text-sm mt-1">Hãy bắt đầu làm bài thi đầu tiên!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {completedExams.map((exam) => {
                  const isPending = exam.myGradingStatus === "pending";
                  const score = exam.myScore ?? exam.score;
                  const passed = exam.myPassed ?? exam.passed;

                  return (
                    <Card key={exam.id}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">{exam.title}</h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="secondary">{exam.className}</Badge>
                                {getStatusBadge(exam)}
                                {isPending && (
                                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse">
                                    ⏳ Chờ chấm tự luận
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Điểm số</p>
                                <p className={`text-2xl font-bold ${
                                  isPending
                                    ? "text-muted-foreground"
                                    : passed
                                    ? "text-success"
                                    : "text-destructive"
                                }`}>
                                  {isPending ? `${score?.toFixed(1) ?? "—"}*` : score?.toFixed(1) ?? "—"}
                                </p>
                                {isPending && (
                                  <p className="text-[10px] text-amber-600 dark:text-amber-400">* Tạm tính</p>
                                )}
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Kết quả</p>
                                {isPending ? (
                                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 mt-1">
                                    Chưa chấm xong
                                  </Badge>
                                ) : (
                                  <Badge className={`mt-1 ${passed ? "bg-success" : "bg-destructive"}`}>
                                    {passed ? "Đạt" : "Chưa đạt"}
                                  </Badge>
                                )}
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Nộp lúc</p>
                                <p className="text-sm font-medium text-foreground">
                                  {exam.mySubmittedAt ?? exam.submittedAt
                                    ? formatDateTime(exam.mySubmittedAt ?? exam.submittedAt ?? "")
                                    : "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Thời gian làm bài</p>
                                <p className="text-sm font-medium text-foreground">
                                  {exam.myTimeSpent != null
                                    ? `${exam.myTimeSpent} phút`
                                    : `${exam.durationMinutes} phút (cho phép)`}
                                </p>
                              </div>
                            </div>
                          </div>

                          <Button variant="outline" onClick={() => navigate(`/user/exam-review?id=${exam.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem lại
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Quá hạn ──────────────────────────────────── */}
          <TabsContent value="missed" className="space-y-4">
            {missedExams.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Không có bài thi quá hạn</p>
                <p className="text-sm mt-1">Bạn đang theo dõi lịch thi rất tốt! 👍</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {missedExams.map((exam) => (
                  <Card key={exam.id} className="opacity-60">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-4">
                        <AlertCircle className="w-8 h-8 text-destructive flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{exam.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="secondary">{exam.className}</Badge>
                            {getStatusBadge(exam)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Ngày thi: {formatDateTime(exam.startAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Chưa có bài thi nào.</p>
        </div>
      )}

      {/* ── Confirmation Dialog ── */}
      <Dialog open={!!confirmExam} onOpenChange={(open) => !open && setConfirmExam(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              {confirmExam && hasExamStarted(confirmExam.id)
                ? "Tiếp tục làm bài"
                : "Xác nhận bắt đầu làm bài"}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2">
                <p>
                  {confirmExam && hasExamStarted(confirmExam.id)
                    ? "Bạn đang tiếp tục bài thi:"
                    : "Bạn sắp bắt đầu bài thi:"}
                </p>
                {confirmExam && (
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                    <p className="font-semibold text-foreground">{confirmExam.title}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Thời gian: {confirmExam.durationMinutes} phút</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>Số câu: {confirmExam.totalQuestions} câu</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">
                    {confirmExam && hasExamStarted(confirmExam.id)
                      ? "⏱️ Đồng hồ đang tiếp tục đếm ngược. Hãy hoàn thành bài thi trước khi hết thời gian."
                      : "⚠️ Lưu ý: Sau khi bắt đầu, đồng hồ sẽ đếm ngược ngay cả khi bạn thoát khỏi trang. Khi hết thời gian, bài thi sẽ tự động được nộp."}
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmExam(null)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmStart} className={`gap-2 ${
              confirmExam && hasExamStarted(confirmExam.id)
                ? "bg-amber-600 hover:bg-amber-700"
                : ""
            }`}>
              {confirmExam && hasExamStarted(confirmExam.id) ? (
                <><RotateCcw className="w-4 h-4" /> Tiếp tục ngay</>
              ) : (
                <><Play className="w-4 h-4" /> Bắt đầu ngay</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
