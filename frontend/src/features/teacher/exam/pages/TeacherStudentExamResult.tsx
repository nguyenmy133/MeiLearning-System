import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  TrendingUp,
  Award,
  Target,
  User,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useExamInfo, useStudentExamResult } from "../hooks";

export function TeacherStudentExamResult() {
  const navigate = useNavigate();
  const { examId, studentId } = useParams<{ examId: string; studentId: string }>();

  const examIdNum = Number(examId);
  const { data: examInfo, isLoading: isLoadingInfo } = useExamInfo(examIdNum);
  const { data: examResult, isLoading: isLoadingResult } = useStudentExamResult(examIdNum, studentId || "");

  const isLoading = isLoadingInfo || isLoadingResult;

  if (isLoading || !examResult || !examInfo) {
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
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  const isPassed = examResult.score >= examResult.passingScore;
  const accuracyRate = (examResult.correctAnswers / examResult.totalQuestions) * 100;

  const handleDownloadResult = () => {
    alert("Tính năng tải kết quả đang được phát triển");
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Teacher context header */}
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
              Đang xem kết quả của học viên{" "}
              <span className="font-semibold text-foreground">
                {examResult.studentName} ({studentId ?? examResult.studentId})
              </span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground mt-1">{examResult.examTitle}</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadResult} className="gap-2">
          <Download className="w-4 h-4" />
          Xuất kết quả
        </Button>
      </div>

      {/* Result Header */}
      <Card
        className={`border-2 ${
          isPassed ? "border-success bg-success/5" : "border-warning bg-warning/5"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Score Circle */}
            <div className="relative">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center border-8 ${
                  isPassed
                    ? "border-success bg-success/10"
                    : "border-warning bg-warning/10"
                }`}
              >
                <div className="text-center">
                  <p
                    className={`text-4xl font-bold ${
                      isPassed ? "text-success" : "text-warning"
                    }`}
                  >
                    {examResult.score}
                  </p>
                  <p className="text-xs text-muted-foreground">/{examResult.maxScore}</p>
                </div>
              </div>
              {isPassed && (
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-success rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left space-y-3">
              <div>
                <Badge
                  className={`mb-2 ${isPassed ? "bg-success" : "bg-warning"}`}
                >
                  {isPassed ? "ĐẠT" : "CHƯA ĐẠT"}
                </Badge>
                <h2 className="text-xl font-bold text-foreground">{examResult.examTitle}</h2>
                <p className="text-muted-foreground mt-1">
                  {examResult.subject} • {examResult.class}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Số câu đúng</p>
                  <p className="text-lg font-bold text-success">
                    {examResult.correctAnswers}/{examResult.totalQuestions}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Độ chính xác</p>
                  <p className="text-lg font-bold text-foreground">
                    {accuracyRate.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Thời gian</p>
                  <p className="text-lg font-bold text-foreground">
                    {examResult.timeSpent}/{examResult.duration} phút
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Xếp hạng</p>
                  <p className="text-lg font-bold text-primary">
                    {examResult.rank}/{examResult.totalStudents}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  {examResult.correctAnswers}
                </p>
                <p className="text-xs text-muted-foreground">Câu đúng</p>
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
                <p className="text-2xl font-bold text-destructive">
                  {examResult.wrongAnswers}
                </p>
                <p className="text-xs text-muted-foreground">Câu sai</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">
                  {examResult.skippedAnswers}
                </p>
                <p className="text-xs text-muted-foreground">Bỏ qua</p>
              </div>
            </div>
          </CardContent>
        </Card>

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

      {/* Performance Analysis */}
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
              <span className="font-semibold">
                {examResult.score}/{examResult.maxScore}
              </span>
            </div>
            <Progress
              value={(examResult.score / examResult.maxScore) * 100}
              className="h-2"
            />
          </div>

          <Separator />

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-foreground">Điểm mạnh:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Làm bài nhanh, tiết kiệm thời gian</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>Nắm vững kiến thức về đạo hàm</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground">Cần cải thiện:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span>Ôn lại phần tích phân</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span>Làm thêm bài tập về khảo sát hàm số</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Answers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Chi tiết bài làm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {examResult.questions.map((q, index) => (
              <AccordionItem key={q.id} value={`question-${q.id}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        q.isCorrect
                          ? "bg-success/10 text-success"
                          : q.yourAnswer
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {q.isCorrect ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : q.yourAnswer ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Câu {index + 1}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {q.question}
                      </p>
                    </div>
                    <Badge
                      variant={
                        q.isCorrect ? "default" : q.yourAnswer ? "destructive" : "secondary"
                      }
                    >
                      {q.isCorrect ? "Đúng" : q.yourAnswer ? "Sai" : "Bỏ qua"}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-11 pr-4 space-y-4">
                    <div>
                      <p className="font-medium text-foreground mb-2">{q.question}</p>

                      {q.type === "multiple-choice" ? (
                        <div className="space-y-2">
                          {q.options?.map((option) => (
                            <div
                              key={option.id}
                              className={`p-3 rounded-lg border-2 ${
                                option.id === q.correctAnswer
                                  ? "border-success bg-success/5"
                                  : option.id === q.yourAnswer && !q.isCorrect
                                  ? "border-destructive bg-destructive/5"
                                  : "border-border"
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {option.id === q.correctAnswer && (
                                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                                )}
                                {option.id === q.yourAnswer && !q.isCorrect && (
                                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <span className="font-semibold mr-2">
                                    {option.id.toUpperCase()}.
                                  </span>
                                  {option.text}
                                  {option.id === q.correctAnswer && (
                                    <Badge className="ml-2 bg-success">Đáp án đúng</Badge>
                                  )}
                                  {option.id === q.yourAnswer && !q.isCorrect && (
                                    <Badge className="ml-2" variant="destructive">
                                      HV chọn
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Câu trả lời của học viên:
                            </p>
                            <p className="text-foreground">
                              {q.yourAnswer || "Không trả lời"}
                            </p>
                          </div>
                          {q.teacherComment && (
                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                              <p className="text-sm font-medium text-primary mb-1">
                                Nhận xét của giáo viên:
                              </p>
                              <p className="text-foreground">{q.teacherComment}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {q.explanation && (
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          💡 Giải thích:
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Teacher Actions - khác với student, không có nút "Làm lại bài thi" */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => navigate(`/teacher/exams/results/${examId}`)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Về danh sách kết quả
        </Button>
        <Button
          variant="default"
          onClick={() => navigate("/teacher/dashboard")}
          className="gap-2"
        >
          <Award className="w-4 h-4" />
          Về Dashboard
        </Button>
      </div>

      {/* Student Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Học viên</p>
              <p className="font-medium text-foreground">
                {examResult.studentName} ({examResult.studentId})
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Thời gian nộp bài</p>
              <p className="font-medium text-foreground">{examResult.submittedAt}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
