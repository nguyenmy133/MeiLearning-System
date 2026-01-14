import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag,
  AlertCircle,
  CheckCircle,
  Send
} from "lucide-react";

// Mock exam data
const examData = {
  id: 1,
  title: "Kiểm tra giữa kỳ - Toán 12",
  subject: "Toán học",
  duration: 60, // minutes
  totalQuestions: 20,
  questions: [
    {
      id: 1,
      type: "multiple-choice",
      question: "Đạo hàm của hàm số y = x² + 3x - 5 là:",
      options: [
        { id: "a", text: "y' = 2x + 3" },
        { id: "b", text: "y' = x + 3" },
        { id: "c", text: "y' = 2x - 3" },
        { id: "d", text: "y' = 2x² + 3" },
      ],
      correctAnswer: "a",
    },
    {
      id: 2,
      type: "multiple-choice",
      question: "Tích phân ∫(2x + 1)dx từ 0 đến 1 bằng:",
      options: [
        { id: "a", text: "1" },
        { id: "b", text: "2" },
        { id: "c", text: "3" },
        { id: "d", text: "4" },
      ],
      correctAnswer: "b",
    },
    {
      id: 3,
      type: "multiple-choice",
      question: "Giới hạn lim(x→0) (sin x)/x bằng:",
      options: [
        { id: "a", text: "0" },
        { id: "b", text: "1" },
        { id: "c", text: "∞" },
        { id: "d", text: "Không tồn tại" },
      ],
      correctAnswer: "b",
    },
    {
      id: 4,
      type: "essay",
      question: "Giải phương trình: x² - 5x + 6 = 0. Trình bày chi tiết các bước giải.",
      maxLength: 500,
    },
    {
      id: 5,
      type: "multiple-choice",
      question: "Hàm số y = x³ - 3x + 1 đồng biến trên khoảng nào?",
      options: [
        { id: "a", text: "(-∞, -1) và (1, +∞)" },
        { id: "b", text: "(-1, 1)" },
        { id: "c", text: "(-∞, +∞)" },
        { id: "d", text: "(0, +∞)" },
      ],
      correctAnswer: "a",
    },
  ],
};

export function ExamTaking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examId = parseInt(searchParams.get("id") || "1");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(examData.duration * 60); // in seconds
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const currentQuestion = examData.questions[currentQuestionIndex];
  const progress = (Object.keys(answers).length / examData.totalQuestions) * 100;

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-save answers to localStorage
  useEffect(() => {
    localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(answers));
  }, [answers, examId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const toggleFlag = (questionId: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleAutoSubmit = () => {
    // Auto-submit when time runs out
    localStorage.removeItem(`exam_${examId}_answers`);
    navigate(`/user/exam-result?id=${examId}&score=75`);
  };

  const handleSubmit = () => {
    localStorage.removeItem(`exam_${examId}_answers`);
    // Calculate score (mock)
    const score = Math.floor((Object.keys(answers).length / examData.totalQuestions) * 100);
    navigate(`/user/exam-result?id=${examId}&score=${score}`);
  };

  const handleExit = () => {
    navigate("/user/exams");
  };

  const getQuestionStatus = (questionId: number) => {
    if (answers[questionId]) return "answered";
    if (flaggedQuestions.has(questionId)) return "flagged";
    return "unanswered";
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">{examData.title}</h1>
              <p className="text-sm text-muted-foreground">{examData.subject}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining < 300 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="text-lg font-bold font-mono">{formatTime(timeRemaining)}</span>
              </div>

              {/* Exit button */}
              <Button 
                variant="outline" 
                onClick={() => setShowExitDialog(true)}
              >
                Thoát
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Đã làm: {Object.keys(answers).length}/{examData.totalQuestions} câu
              </span>
              <span className="font-medium text-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">
                        Câu {currentQuestionIndex + 1}/{examData.totalQuestions}
                      </Badge>
                      <Badge variant="outline">
                        {currentQuestion.type === "multiple-choice" ? "Trắc nghiệm" : "Tự luận"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-relaxed">
                      {currentQuestion.question}
                    </CardTitle>
                  </div>
                  <Button
                    variant={flaggedQuestions.has(currentQuestion.id) ? "default" : "outline"}
                    size="icon"
                    onClick={() => toggleFlag(currentQuestion.id)}
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {currentQuestion.type === "multiple-choice" ? (
                  <RadioGroup
                    value={answers[currentQuestion.id] || ""}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  >
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option) => (
                        <div
                          key={option.id}
                          className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                            answers[currentQuestion.id] === option.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
                        >
                          <RadioGroupItem value={option.id} id={option.id} className="mt-0.5" />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer text-base">
                            <span className="font-semibold mr-2">{option.id.toUpperCase()}.</span>
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="essay-answer">Câu trả lời của bạn:</Label>
                    <Textarea
                      id="essay-answer"
                      placeholder="Nhập câu trả lời chi tiết..."
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="min-h-[200px] text-base"
                      maxLength={currentQuestion.maxLength}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {(answers[currentQuestion.id] || "").length}/{currentQuestion.maxLength} ký tự
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Câu trước
              </Button>

              {currentQuestionIndex === examData.questions.length - 1 ? (
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  className="gap-2 bg-success hover:bg-success/90"
                >
                  <Send className="w-4 h-4" />
                  Nộp bài
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="gap-2"
                >
                  Câu sau
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar - Question Navigator */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Danh sách câu hỏi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {examData.questions.map((q, index) => {
                    const status = getQuestionStatus(q.id);
                    return (
                      <button
                        key={q.id}
                        onClick={() => handleQuestionJump(index)}
                        className={`aspect-square rounded-lg border-2 font-semibold text-sm transition-all relative ${
                          currentQuestionIndex === index
                            ? "border-primary bg-primary text-primary-foreground scale-110"
                            : status === "answered"
                            ? "border-success bg-success/10 text-success hover:bg-success/20"
                            : status === "flagged"
                            ? "border-warning bg-warning/10 text-warning hover:bg-warning/20"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {index + 1}
                        {flaggedQuestions.has(q.id) && (
                          <Flag className="w-3 h-3 absolute top-0.5 right-0.5 fill-current" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border-2 border-success bg-success/10" />
                    <span className="text-muted-foreground">Đã trả lời</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border-2 border-warning bg-warning/10" />
                    <span className="text-muted-foreground">Đánh dấu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border-2 border-border" />
                    <span className="text-muted-foreground">Chưa làm</span>
                  </div>
                </div>

                {/* Submit button in sidebar */}
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  className="w-full mt-6 gap-2"
                  variant="default"
                >
                  <Send className="w-4 h-4" />
                  Nộp bài
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Xác nhận nộp bài
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Bạn có chắc chắn muốn nộp bài không?</p>
              <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                <p>• Đã làm: <strong>{Object.keys(answers).length}/{examData.totalQuestions}</strong> câu</p>
                <p>• Chưa làm: <strong>{examData.totalQuestions - Object.keys(answers).length}</strong> câu</p>
                <p>• Thời gian còn lại: <strong>{formatTime(timeRemaining)}</strong></p>
              </div>
              <p className="text-destructive font-medium">
                Sau khi nộp bài, bạn không thể chỉnh sửa câu trả lời!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kiểm tra lại</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} className="bg-success hover:bg-success/90">
              Nộp bài
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Thoát bài thi
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn thoát? Tiến độ làm bài sẽ được lưu tự động.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ở lại</AlertDialogCancel>
            <AlertDialogAction onClick={handleExit} className="bg-destructive hover:bg-destructive/90">
              Thoát
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
