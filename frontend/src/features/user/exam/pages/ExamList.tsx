import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "@/lib/dateUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Trophy,
  Calendar,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { useMyExams } from "@/features/user/exam/hooks";
import type { ExamDetail } from "@/features/user/exam/types";

export function ExamList() {
  const navigate = useNavigate();
  const { data: exams = [], isLoading } = useMyExams();
  const [confirmExam, setConfirmExam] = useState<ExamDetail | null>(null);

  const availableExams = exams.filter((e) => e.status === "upcoming" || e.status === "ongoing");
  const completedExams = exams.filter((e) => e.status === "completed");
  const missedExams = exams.filter((e) => e.status === "missed");

  const getStatusBadge = (exam: ExamDetail) => {
    switch (exam.status) {
      case "upcoming":
        return <Badge className="bg-primary">Sẵn sàng</Badge>;
      case "ongoing":
        return <Badge className="bg-warning">Đang làm</Badge>;
      case "completed":
        return <Badge className="bg-success">Hoàn thành</Badge>;
      case "missed":
        return <Badge variant="destructive">Đã quá hạn</Badge>;
    }
  };

  const handleStartExam = (exam: ExamDetail) => {
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{exams.length}</p>
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
                <p className="text-2xl font-bold">{completedExams.length}</p>
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
                <p className="text-2xl font-bold">{availableExams.length}</p>
                <p className="text-xs text-muted-foreground">Chưa làm</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{missedExams.length}</p>
                <p className="text-xs text-muted-foreground">Quá hạn</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Exams */}
      {availableExams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Bài thi sẵn sàng</h2>
          <div className="grid gap-4">
            {availableExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
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

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
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
                          <span>{formatDateTime(exam.startAt)}</span>
                        </div>
                        {exam.endAt && (
                          <div className="flex items-center gap-2 text-destructive font-medium">
                            <AlertCircle className="w-4 h-4" />
                            <span>Hạn: {formatDateTime(exam.endAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button className="gap-2" onClick={() => handleStartExam(exam)}>
                      <Play className="w-4 h-4" />
                      Bắt đầu làm bài
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Exams */}
      {completedExams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Bài thi đã hoàn thành</h2>
          <div className="grid gap-4">
            {completedExams.map((exam) => (
              <Card key={exam.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{exam.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary">{exam.className}</Badge>
                          {getStatusBadge(exam)}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Điểm số</p>
                          <p className={`text-2xl font-bold ${exam.passed ? "text-success" : "text-destructive"}`}>
                            {exam.score?.toFixed(1)}/10
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Kết quả</p>
                          <Badge className={exam.passed ? "bg-success" : "bg-destructive"}>
                            {exam.passed ? "Đạt" : "Chưa đạt"}
                          </Badge>
                        </div>
                        {exam.submittedAt && (
                          <div>
                            <p className="text-sm text-muted-foreground">Nộp lúc</p>
                            <p className="text-sm font-medium text-foreground">
                              {formatDateTime(exam.submittedAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button variant="outline" onClick={() => navigate(`/user/exam-review?id=${exam.id}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Xem lại
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Missed Exams */}
      {missedExams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Bài thi đã quá hạn</h2>
          <div className="grid gap-4">
            {missedExams.map((exam) => (
              <Card key={exam.id} className="opacity-60">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <AlertCircle className="w-8 h-8 text-destructive flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{exam.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ngày thi: {formatDateTime(exam.startAt)}
                      </p>
                    </div>
                    {getStatusBadge(exam)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {exams.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Chưa có bài thi nào.</p>
        </div>
      )}

      {/* ── Confirmation Dialog ── */}
      <Dialog open={!!confirmExam} onOpenChange={(open) => !open && setConfirmExam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Xác nhận bắt đầu làm bài
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2">
                <p>Bạn sắp bắt đầu bài thi:</p>
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
                    ⚠️ Lưu ý: Sau khi bắt đầu, đồng hồ sẽ đếm ngược ngay cả khi bạn thoát khỏi trang.
                    Khi hết thời gian, bài thi sẽ tự động được nộp.
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmExam(null)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmStart} className="gap-2">
              <Play className="w-4 h-4" />
              Bắt đầu ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
