import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Plus,
  Trash2,
  GripVertical,
  Eye
} from "lucide-react";

interface Question {
  id: string;
  type: "multiple-choice" | "essay";
  question: string;
  options?: { id: string; text: string }[];
  correctAnswer?: string;
  points: number;
  explanation?: string;
}

export function CreateExamPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("id") !== null;
  
  const [step, setStep] = useState(1);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  // Step 1: Basic Info
  const [examInfo, setExamInfo] = useState({
    title: "",
    subject: "",
    classes: [] as string[],
    duration: 60,
    startTime: "",
    endTime: "",
    maxAttempts: 1,
    passingScore: 70,
    description: "",
  });

  // Step 2: Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] = useState<Question>({
    id: "",
    type: "multiple-choice",
    question: "",
    options: [
      { id: "a", text: "" },
      { id: "b", text: "" },
      { id: "c", text: "" },
      { id: "d", text: "" },
    ],
    correctAnswer: "",
    points: 1,
    explanation: "",
  });

  const handleAddQuestion = () => {
    if (!questionForm.question) return;
    
    const newQuestion = {
      ...questionForm,
      id: Date.now().toString(),
    };
    
    if (editingQuestion) {
      setQuestions(questions.map(q => q.id === editingQuestion.id ? newQuestion : q));
      setEditingQuestion(null);
    } else {
      setQuestions([...questions, newQuestion]);
    }
    
    // Reset form
    setQuestionForm({
      id: "",
      type: "multiple-choice",
      question: "",
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
        { id: "d", text: "" },
      ],
      correctAnswer: "",
      points: 1,
      explanation: "",
    });
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm(question);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSaveDraft = () => {
    console.log("Save draft:", { examInfo, questions });
    navigate("/teacher/exams");
  };

  const handlePublish = () => {
    console.log("Publish exam:", { examInfo, questions });
    setPublishDialogOpen(false);
    navigate("/teacher/exams");
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/teacher/exams")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? "Chỉnh sửa bài thi" : "Tạo bài thi mới"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Bước {step}/3: {step === 1 ? "Thông tin cơ bản" : step === 2 ? "Thêm câu hỏi" : "Xem trước & Xuất bản"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
            <Save className="w-4 h-4" />
            Lưu nháp
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                s === step
                  ? "bg-primary text-primary-foreground"
                  : s < step
                  ? "bg-success text-success-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`w-16 h-1 ${s < step ? "bg-success" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tên bài thi *</Label>
                <Input
                  id="title"
                  placeholder="VD: Kiểm tra giữa kỳ - Toán 12"
                  value={examInfo.title}
                  onChange={(e) => setExamInfo({ ...examInfo, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Môn học *</Label>
                <Select value={examInfo.subject} onValueChange={(v) => setExamInfo({ ...examInfo, subject: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Toán">Toán</SelectItem>
                    <SelectItem value="Vật Lý">Vật Lý</SelectItem>
                    <SelectItem value="Hóa Học">Hóa Học</SelectItem>
                    <SelectItem value="Tiếng Anh">Tiếng Anh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Thời gian (phút) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={examInfo.duration}
                  onChange={(e) => setExamInfo({ ...examInfo, duration: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Số lần làm tối đa</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  value={examInfo.maxAttempts}
                  onChange={(e) => setExamInfo({ ...examInfo, maxAttempts: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingScore">Điểm đạt (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={examInfo.passingScore}
                  onChange={(e) => setExamInfo({ ...examInfo, passingScore: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Thời gian mở</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={examInfo.startTime}
                  onChange={(e) => setExamInfo({ ...examInfo, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Thời gian đóng</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={examInfo.endTime}
                  onChange={(e) => setExamInfo({ ...examInfo, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả về bài thi..."
                value={examInfo.description}
                onChange={(e) => setExamInfo({ ...examInfo, description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Questions */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Question Form */}
          <Card>
            <CardHeader>
              <CardTitle>{editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Loại câu hỏi</Label>
                <RadioGroup
                  value={questionForm.type}
                  onValueChange={(v: any) => setQuestionForm({ ...questionForm, type: v })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple-choice" id="mc" />
                    <Label htmlFor="mc">Trắc nghiệm</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="essay" id="essay" />
                    <Label htmlFor="essay">Tự luận</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question">Câu hỏi *</Label>
                <Textarea
                  id="question"
                  placeholder="Nhập nội dung câu hỏi..."
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  rows={3}
                />
              </div>

              {questionForm.type === "multiple-choice" && (
                <div className="space-y-3">
                  <Label>Các đáp án</Label>
                  {questionForm.options?.map((option, idx) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <RadioGroup
                        value={questionForm.correctAnswer}
                        onValueChange={(v) => setQuestionForm({ ...questionForm, correctAnswer: v })}
                      >
                        <RadioGroupItem value={option.id} id={`opt-${option.id}`} />
                      </RadioGroup>
                      <Label htmlFor={`opt-${option.id}`} className="font-semibold w-8">
                        {option.id.toUpperCase()}.
                      </Label>
                      <Input
                        placeholder={`Đáp án ${option.id.toUpperCase()}`}
                        value={option.text}
                        onChange={(e) => {
                          const newOptions = [...(questionForm.options || [])];
                          newOptions[idx].text = e.target.value;
                          setQuestionForm({ ...questionForm, options: newOptions });
                        }}
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Chọn radio button bên trái để đánh dấu đáp án đúng
                  </p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="points">Điểm số</Label>
                  <Input
                    id="points"
                    type="number"
                    value={questionForm.points}
                    onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Giải thích (tùy chọn)</Label>
                <Textarea
                  id="explanation"
                  placeholder="Giải thích đáp án đúng..."
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddQuestion} className="gap-2">
                  <Plus className="w-4 h-4" />
                  {editingQuestion ? "Cập nhật câu hỏi" : "Thêm câu hỏi"}
                </Button>
                {editingQuestion && (
                  <Button variant="outline" onClick={() => {
                    setEditingQuestion(null);
                    setQuestionForm({
                      id: "",
                      type: "multiple-choice",
                      question: "",
                      options: [
                        { id: "a", text: "" },
                        { id: "b", text: "" },
                        { id: "c", text: "" },
                        { id: "d", text: "" },
                      ],
                      correctAnswer: "",
                      points: 1,
                      explanation: "",
                    });
                  }}>
                    Hủy
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách câu hỏi ({questions.length})</CardTitle>
                <Badge variant="secondary">Tổng điểm: {totalPoints}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có câu hỏi nào. Thêm câu hỏi ở form bên trên.
                </p>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <GripVertical className="w-5 h-5 text-muted-foreground mt-1 cursor-move" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">
                              Câu {idx + 1}: {q.question}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{q.type === "multiple-choice" ? "Trắc nghiệm" : "Tự luận"}</Badge>
                              <Badge variant="secondary">{q.points} điểm</Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditQuestion(q)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Xem trước bài thi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{examInfo.title}</h3>
                <p className="text-muted-foreground">{examInfo.description}</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Môn học</p>
                  <p className="font-semibold">{examInfo.subject}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Thời gian</p>
                  <p className="font-semibold">{examInfo.duration} phút</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Số câu hỏi</p>
                  <p className="font-semibold">{questions.length} câu</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Câu hỏi:</h4>
                {questions.map((q, idx) => (
                  <div key={q.id} className="space-y-2">
                    <p className="font-medium">
                      Câu {idx + 1}: {q.question} ({q.points} điểm)
                    </p>
                    {q.type === "multiple-choice" && (
                      <div className="pl-4 space-y-1">
                        {q.options?.map((opt) => (
                          <p key={opt.id} className={opt.id === q.correctAnswer ? "text-success font-medium" : ""}>
                            {opt.id.toUpperCase()}. {opt.text}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>

        <div className="flex gap-2">
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !examInfo.title}
              className="gap-2"
            >
              Tiếp theo
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setPublishDialogOpen(true)}
              disabled={questions.length === 0}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Xuất bản
            </Button>
          )}
        </div>
      </div>

      {/* Publish Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xuất bản bài thi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xuất bản bài thi này? Học viên sẽ có thể thấy và làm bài thi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish}>Xuất bản</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
