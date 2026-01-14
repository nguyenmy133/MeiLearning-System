import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Clock, 
  FileText, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Trophy,
  Calendar
} from "lucide-react";

// Mock data
const exams = [
  {
    id: 1,
    title: "Kiểm tra giữa kỳ - Toán 12",
    subject: "Toán học",
    class: "Toán 12A",
    duration: 60, // minutes
    totalQuestions: 20,
    passingScore: 70,
    startTime: "2024-01-20 14:00",
    endTime: "2024-01-20 15:30",
    status: "available", // available, in-progress, completed, missed
    attempts: 0,
    maxAttempts: 1,
  },
  {
    id: 2,
    title: "Bài tập tuần 3 - Tiếng Anh",
    subject: "Tiếng Anh",
    class: "Tiếng Anh 10B",
    duration: 30,
    totalQuestions: 15,
    passingScore: 60,
    startTime: "2024-01-15 10:00",
    endTime: "2024-01-22 23:59",
    status: "completed",
    attempts: 1,
    maxAttempts: 2,
    score: 85,
    correctAnswers: 13,
  },
  {
    id: 3,
    title: "Ôn tập chương 1 - Vật lý",
    subject: "Vật lý",
    class: "Vật lý 11A",
    duration: 45,
    totalQuestions: 25,
    passingScore: 65,
    startTime: "2024-01-10 08:00",
    endTime: "2024-01-17 23:59",
    status: "missed",
    attempts: 0,
    maxAttempts: 1,
  },
];

export function ExamList() {
  const navigate = useNavigate();

  const getStatusBadge = (exam: typeof exams[0]) => {
    switch (exam.status) {
      case "available":
        return <Badge className="bg-primary">Sẵn sàng</Badge>;
      case "in-progress":
        return <Badge className="bg-warning">Đang làm</Badge>;
      case "completed":
        return <Badge className="bg-success">Hoàn thành</Badge>;
      case "missed":
        return <Badge variant="destructive">Đã quá hạn</Badge>;
      default:
        return null;
    }
  };

  const handleStartExam = (examId: number) => {
    navigate(`/user/exam-taking?id=${examId}`);
  };

  const availableExams = exams.filter(e => e.status === "available");
  const completedExams = exams.filter(e => e.status === "completed");
  const missedExams = exams.filter(e => e.status === "missed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Bài thi trực tuyến
        </h1>
        <p className="text-muted-foreground mt-1">
          Danh sách bài thi và kết quả
        </p>
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
                            <Badge variant="secondary">{exam.subject}</Badge>
                            <Badge variant="outline">{exam.class}</Badge>
                            {getStatusBadge(exam)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{exam.duration} phút</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>{exam.totalQuestions} câu</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Trophy className="w-4 h-4" />
                          <span>Đạt: {exam.passingScore}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Hạn: {exam.endTime}</span>
                        </div>
                      </div>

                      {exam.attempts < exam.maxAttempts && (
                        <p className="text-xs text-muted-foreground">
                          Còn {exam.maxAttempts - exam.attempts} lượt làm bài
                        </p>
                      )}
                    </div>

                    <Button 
                      className="gap-2"
                      onClick={() => handleStartExam(exam.id)}
                    >
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
                          <Badge variant="secondary">{exam.subject}</Badge>
                          <Badge variant="outline">{exam.class}</Badge>
                          {getStatusBadge(exam)}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Điểm số</p>
                          <p className={`text-2xl font-bold ${exam.score! >= exam.passingScore ? 'text-success' : 'text-destructive'}`}>
                            {exam.score}/100
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Số câu đúng</p>
                          <p className="text-lg font-semibold text-foreground">
                            {exam.correctAnswers}/{exam.totalQuestions}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Kết quả</p>
                          <Badge className={exam.score! >= exam.passingScore ? 'bg-success' : 'bg-destructive'}>
                            {exam.score! >= exam.passingScore ? 'Đạt' : 'Chưa đạt'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/user/exam-result?id=${exam.id}`)}
                    >
                      Xem chi tiết
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
                        Hạn nộp: {exam.endTime}
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
    </div>
  );
}
