import { useNavigate, useSearchParams } from "react-router-dom";
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
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  Share2,
  Home,
  RotateCcw,
  TrendingUp,
  Award,
  Target
} from "lucide-react";

// Mock exam result data
const examResult = {
  examId: 1,
  examTitle: "Kiểm tra giữa kỳ - Toán 12",
  subject: "Toán học",
  class: "Toán 12A",
  studentName: "Nguyễn Văn A",
  studentId: "HV001",
  submittedAt: "2024-01-20 15:25:30",
  duration: 60, // minutes
  timeSpent: 55, // minutes
  totalQuestions: 20,
  correctAnswers: 15,
  wrongAnswers: 4,
  skippedAnswers: 1,
  score: 75,
  passingScore: 70,
  maxScore: 100,
  rank: 5,
  totalStudents: 25,
  questions: [
    {
      id: 1,
      question: "Đạo hàm của hàm số y = x² + 3x - 5 là:",
      type: "multiple-choice",
      yourAnswer: "a",
      correctAnswer: "a",
      isCorrect: true,
      options: [
        { id: "a", text: "y' = 2x + 3" },
        { id: "b", text: "y' = x + 3" },
        { id: "c", text: "y' = 2x - 3" },
        { id: "d", text: "y' = 2x² + 3" },
      ],
      explanation: "Áp dụng công thức đạo hàm cơ bản: (x^n)' = n*x^(n-1) và (c)' = 0",
    },
    {
      id: 2,
      question: "Tích phân ∫(2x + 1)dx từ 0 đến 1 bằng:",
      type: "multiple-choice",
      yourAnswer: "a",
      correctAnswer: "b",
      isCorrect: false,
      options: [
        { id: "a", text: "1" },
        { id: "b", text: "2" },
        { id: "c", text: "3" },
        { id: "d", text: "4" },
      ],
      explanation: "∫(2x + 1)dx = x² + x. Thay cận: (1² + 1) - (0² + 0) = 2",
    },
    {
      id: 3,
      question: "Giới hạn lim(x→0) (sin x)/x bằng:",
      type: "multiple-choice",
      yourAnswer: "b",
      correctAnswer: "b",
      isCorrect: true,
      options: [
        { id: "a", text: "0" },
        { id: "b", text: "1" },
        { id: "c", text: "∞" },
        { id: "d", text: "Không tồn tại" },
      ],
      explanation: "Đây là giới hạn đặc biệt cơ bản: lim(x→0) (sin x)/x = 1",
    },
    {
      id: 4,
      question: "Giải phương trình: x² - 5x + 6 = 0",
      type: "essay",
      yourAnswer: "x₁ = 2, x₂ = 3",
      correctAnswer: "x = 2 hoặc x = 3",
      isCorrect: true,
      teacherComment: "Bài làm đúng, trình bày rõ ràng. Điểm: 10/10",
    },
    {
      id: 5,
      question: "Hàm số y = x³ - 3x + 1 đồng biến trên khoảng nào?",
      type: "multiple-choice",
      yourAnswer: "",
      correctAnswer: "a",
      isCorrect: false,
      options: [
        { id: "a", text: "(-∞, -1) và (1, +∞)" },
        { id: "b", text: "(-1, 1)" },
        { id: "c", text: "(-∞, +∞)" },
        { id: "d", text: "(0, +∞)" },
      ],
      explanation: "Tính y' = 3x² - 3. Hàm đồng biến khi y' > 0 ⟺ x² > 1 ⟺ x < -1 hoặc x > 1",
    },
  ],
};

export function ExamResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const score = parseInt(searchParams.get("score") || "75");

  const isPassed = examResult.score >= examResult.passingScore;
  const accuracyRate = (examResult.correctAnswers / examResult.totalQuestions) * 100;

  const handleDownloadResult = () => {
    // Mock download functionality
    alert("Tính năng tải kết quả đang được phát triển");
  };

  const handleShare = () => {
    // Mock share functionality
    alert("Tính năng chia sẻ đang được phát triển");
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Result Header */}
      <Card className={`border-2 ${isPassed ? 'border-success bg-success/5' : 'border-warning bg-warning/5'}`}>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Score Circle */}
            <div className="relative">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center border-8 ${
                isPassed ? 'border-success bg-success/10' : 'border-warning bg-warning/10'
              }`}>
                <div className="text-center">
                  <p className={`text-4xl font-bold ${isPassed ? 'text-success' : 'text-warning'}`}>
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
                <Badge className={`mb-2 ${isPassed ? 'bg-success' : 'bg-warning'}`}>
                  {isPassed ? 'ĐẠT' : 'CHƯA ĐẠT'}
                </Badge>
                <h1 className="text-2xl font-bold text-foreground">{examResult.examTitle}</h1>
                <p className="text-muted-foreground mt-1">
                  {examResult.subject} • {examResult.class}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Số câu đúng</p>
                  <p className="text-lg font-bold text-success">{examResult.correctAnswers}/{examResult.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Độ chính xác</p>
                  <p className="text-lg font-bold text-foreground">{accuracyRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Thời gian</p>
                  <p className="text-lg font-bold text-foreground">{examResult.timeSpent}/{examResult.duration} phút</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Xếp hạng</p>
                  <p className="text-lg font-bold text-primary">{examResult.rank}/{examResult.totalStudents}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex lg:flex-col gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadResult} className="gap-2">
                <Download className="w-4 h-4" />
                Tải về
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="w-4 h-4" />
                Chia sẻ
              </Button>
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
                <p className="text-2xl font-bold text-success">{examResult.correctAnswers}</p>
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
                <p className="text-2xl font-bold text-destructive">{examResult.wrongAnswers}</p>
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
                <p className="text-2xl font-bold text-muted-foreground">{examResult.skippedAnswers}</p>
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
                <p className="text-2xl font-bold text-primary">{accuracyRate.toFixed(0)}%</p>
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
              <span className="font-semibold">{examResult.score}/{examResult.maxScore}</span>
            </div>
            <Progress value={(examResult.score / examResult.maxScore) * 100} className="h-2" />
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      q.isCorrect 
                        ? 'bg-success/10 text-success' 
                        : q.yourAnswer 
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'
                    }`}>
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
                      <p className="text-sm text-muted-foreground line-clamp-1">{q.question}</p>
                    </div>
                    <Badge variant={q.isCorrect ? "default" : q.yourAnswer ? "destructive" : "secondary"}>
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
                                  ? 'border-success bg-success/5'
                                  : option.id === q.yourAnswer && !q.isCorrect
                                  ? 'border-destructive bg-destructive/5'
                                  : 'border-border'
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
                                  <span className="font-semibold mr-2">{option.id.toUpperCase()}.</span>
                                  {option.text}
                                  {option.id === q.correctAnswer && (
                                    <Badge className="ml-2 bg-success">Đáp án đúng</Badge>
                                  )}
                                  {option.id === q.yourAnswer && !q.isCorrect && (
                                    <Badge className="ml-2" variant="destructive">Bạn chọn</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Câu trả lời của bạn:</p>
                            <p className="text-foreground">{q.yourAnswer || "Không trả lời"}</p>
                          </div>
                          {q.teacherComment && (
                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                              <p className="text-sm font-medium text-primary mb-1">Nhận xét của giáo viên:</p>
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
                        <p className="text-sm text-blue-800 dark:text-blue-200">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => navigate("/user/exams")}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          Về danh sách bài thi
        </Button>
        {!isPassed && (
          <Button
            onClick={() => navigate(`/user/exam-taking?id=${examResult.examId}`)}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Làm lại bài thi
          </Button>
        )}
        <Button
          variant="default"
          onClick={() => navigate("/user/dashboard")}
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
              <p className="font-medium text-foreground">{examResult.studentName} ({examResult.studentId})</p>
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
