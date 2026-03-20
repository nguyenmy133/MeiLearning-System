import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Eye,
  Check,
  FileText,
  HelpCircle,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateExam, usePublishExam, useExamDetail, useUpdateExam } from "../hooks";
import { authService } from "@/features/shared/auth/authService";
import { classService } from "@/features/teacher/classes/services/classService";

interface Question {
  id: string;
  type: "multiple-choice" | "essay";
  question: string;
  options?: { id: string; text: string }[];
  correctAnswer?: string;
  points: number;
  explanation?: string;
}

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { number: 1, label: "Thông tin cơ bản", icon: FileText },
  { number: 2, label: "Thêm câu hỏi", icon: HelpCircle },
  { number: 3, label: "Xem trước & Xuất bản", icon: ClipboardCheck },
] as const;

export function CreateExamPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: editIdParam } = useParams<{ id: string }>();
  const editId = editIdParam ? Number(editIdParam) : null; // null = create mode
  const duplicateFromId = searchParams.get("duplicate");

  const [step, setStep] = useState(1);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  // ── API hooks ─────────────────────────────────────────────────────────────
  const createExam = useCreateExam();
  const updateExam = useUpdateExam();
  const publishExamMutation = usePublishExam();

  // ── Load teacher's classes ────────────────────────────────────────────────
  // Backend tự filter theo teacher từ JWT
  const { data: teacherClasses = [] } = useQuery({
    queryKey: ["teacher", "classes"],
    queryFn: () => classService.getTeacherClasses(),
  });

  // Step 1: Basic Info
  const [examInfo, setExamInfo] = useState({
    title: "",
    subject: "",
    classIds: [] as number[],
    duration: 60,
    startTime: "",
    endTime: "",
    maxAttempts: 1,
    passingScore: 70,
    description: "",
  });

  // Step 2: Questions
  const [questions, setQuestions] = useState<Question[]>([]);

  // ── Fetch exam when EDITING an existing exam ─────────────────────────────
  const { data: editExam, isSuccess: editLoaded } = useExamDetail(editId ?? 0);

  // Redirect if the exam is not a draft (can't edit published/ended exams via this page)
  useEffect(() => {
    if (!editId || !editLoaded || !editExam) return;
    if (editExam.status !== "draft") {
      toast.error("Chỉ có thể chỉnh sửa bài thi đang ở trạng thái Nháp.");
      navigate(`/teacher/exams/detail/${editId}`, { replace: true });
    }
  }, [editId, editLoaded, editExam, navigate]);

  // Pre-fill form once when edit exam loads
  useEffect(() => {
    if (!editId || !editLoaded || !editExam || prefilled) return;
    setExamInfo({
      title: editExam.title,
      subject: editExam.subject ?? "",
      classIds: editExam.classIds ?? [],
      duration: editExam.duration ?? 60,
      startTime: editExam.startTime ? editExam.startTime.slice(0, 16) : "",
      endTime: editExam.endTime ? editExam.endTime.slice(0, 16) : "",
      maxAttempts: 1,
      passingScore: 70,
      description: editExam.description ?? "",
    });
    if (editExam.questions && editExam.questions.length > 0) {
      const mapped: Question[] = editExam.questions.map((q, idx) => ({
        id: `edit-${idx}`,
        type: (q.type as any) ?? "multiple-choice",
        question: q.question,
        options: q.options
          ? (() => { try { return JSON.parse(q.options!); } catch { return []; } })()
          : [],
        correctAnswer: q.correctAnswer ?? "",
        points: q.points ?? 1,
        explanation: q.explanation ?? "",
      }));
      setQuestions(mapped);
    }
    setPrefilled(true);
  }, [editId, editLoaded, editExam, prefilled]);

  // ── Fetch source exam when DUPLICATING ────────────────────────────────
  const { data: sourceExam, isSuccess: sourceLoaded } = useExamDetail(
    duplicateFromId ? Number(duplicateFromId) : 0
  );

  // Once source exam loads, pre-fill the form (runs only once)
  useEffect(() => {
    if (!sourceLoaded || !sourceExam || prefilled) return;
    setExamInfo({
      title: `Copy of ${sourceExam.title}`,
      subject: sourceExam.subject ?? "",
      classIds: [],          // intentionally clear — teacher picks new class
      duration: sourceExam.duration ?? 60,
      startTime: "",         // clear timing — must set new schedule
      endTime: "",
      maxAttempts: 1,
      passingScore: 70,
      description: sourceExam.description ?? "",
    });
    // Pre-fill questions from source exam
    if (sourceExam.questions && sourceExam.questions.length > 0) {
      const mapped: Question[] = sourceExam.questions.map((q, idx) => ({
        id: `dup-${idx}`,
        type: (q.type as any) ?? "multiple-choice",
        question: q.question,
        options: q.options
          ? (() => { try { return JSON.parse(q.options!); } catch { return []; } })()
          : [],
        correctAnswer: q.correctAnswer ?? "",
        points: q.points ?? 1,
        explanation: q.explanation ?? "",
      }));
      setQuestions(mapped);
    }
    setPrefilled(true);
  }, [sourceLoaded, sourceExam, prefilled]);

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

  // Normalise: backend may return paginated or flat array
  const classList: { id: number; name: string; subject: string }[] = useMemo(() => {
    const raw = Array.isArray(teacherClasses)
      ? teacherClasses
      : (teacherClasses as any)?.data ?? (teacherClasses as any)?.content ?? [];
    return raw.map((c: any) => ({
      id: c.id ?? c.classId,
      name: c.name ?? c.className ?? `Lớp ${c.id}`,
      subject: c.subject ?? "",
    }));
  }, [teacherClasses]);

  // Auto-detect subject from selected classes
  const detectedSubject = useMemo(() => {
    if (examInfo.classIds.length === 0) return "";
    const subjects = new Set(
      examInfo.classIds
        .map((id) => classList.find((c) => c.id === id)?.subject)
        .filter(Boolean)
    );
    return subjects.size === 1 ? [...subjects][0]! : "";
  }, [examInfo.classIds, classList]);

  // ── Validation ────────────────────────────────────────────────────────────
  const effectiveSubject = examInfo.subject || detectedSubject;
  const step1Valid = !!(examInfo.title.trim() && effectiveSubject && examInfo.duration > 0);

  const toggleClassId = (classId: number) => {
    setExamInfo((prev) => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter((id) => id !== classId)
        : [...prev.classIds, classId],
    }));
  };

  const handleAddQuestion = () => {
    if (!questionForm.question) return;

    const newQuestion = {
      ...questionForm,
      id: Date.now().toString(),
    };

    if (editingQuestion) {
      setQuestions(questions.map((q) => (q.id === editingQuestion.id ? newQuestion : q)));
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
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // ── API Handlers ──────────────────────────────────────────────────────────
  const buildPayload = () => ({
    title: examInfo.title.trim(),
    subject: effectiveSubject,
    classIds: examInfo.classIds,
    duration: Number(examInfo.duration),
    startTime: examInfo.startTime || undefined,
    endTime: examInfo.endTime || undefined,
    description: examInfo.description,
    maxAttempts: examInfo.maxAttempts,
    passingScore: examInfo.passingScore,
    totalQuestions: questions.length,
    questions: questions.map((q) => ({
      type: q.type,
      question: q.question,
      options: q.options ? JSON.stringify(q.options) : undefined,
      correctAnswer: q.correctAnswer,
      points: q.points,
      explanation: q.explanation,
    })),
  });


  const handleSaveDraft = () => {
    if (!step1Valid) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (tên, môn học, thời gian).");
      setStep(1);
      return;
    }

    if (editId) {
      // ── EDIT mode: Update existing exam ─────────────────────────────────
      updateExam.mutate(
        { id: editId, data: buildPayload() },
        { onSuccess: () => navigate("/teacher/exams") }
      );
    } else {
      // ── CREATE mode: New exam ────────────────────────────────────────────
      createExam.mutate(buildPayload(), {
        onSuccess: () => navigate("/teacher/exams"),
      });
    }
  };

  const handlePublish = () => {
    if (!step1Valid) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      setPublishDialogOpen(false);
      setStep(1);
      return;
    }
    if (questions.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 câu hỏi trước khi xuất bản.");
      setPublishDialogOpen(false);
      setStep(2);
      return;
    }

    if (editId) {
      // ── EDIT mode: update first, then publish ─────────────────────────
      updateExam.mutate(
        { id: editId, data: buildPayload() },
        {
          onSuccess: () => {
            publishExamMutation.mutate(editId, {
              onSuccess: () => {
                setPublishDialogOpen(false);
                navigate("/teacher/exams");
              },
            });
          },
        }
      );
    } else {
      // ── CREATE mode: create draft then publish ────────────────────────
      createExam.mutate(buildPayload(), {
        onSuccess: (exam) => {
          publishExamMutation.mutate(exam.id, {
            onSuccess: () => {
              setPublishDialogOpen(false);
              navigate("/teacher/exams");
            },
          });
        },
      });
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const isMutating =
    createExam.isPending ||
    updateExam.isPending ||
    publishExamMutation.isPending;

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
              {editId ? "Chỉnh sửa bài thi" : duplicateFromId ? "Nhân bản bài thi" : "Tạo bài thi mới"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {STEPS[step - 1].label}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="gap-2"
            disabled={isMutating}
          >
            <Save className="w-4 h-4" />
            Lưu nháp
          </Button>
        </div>
      </div>

      {/* ── Professional Step Indicator ─────────────────────────────────────── */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center">
          {STEPS.map((s, idx) => {
            const StepIcon = s.icon;
            const isCompleted = step > s.number;
            const isCurrent = step === s.number;
            const isLast = idx === STEPS.length - 1;

            return (
              <div key={s.number} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                {/* Step circle + label */}
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      // Allow going back but not forward past completed steps
                      if (s.number <= step) setStep(s.number);
                    }}
                    className={`
                      w-11 h-11 rounded-full flex items-center justify-center
                      font-semibold text-sm transition-all duration-300 cursor-pointer
                      ring-2 ring-offset-2 ring-offset-background
                      ${
                        isCompleted
                          ? "bg-emerald-500 text-white ring-emerald-500 shadow-lg shadow-emerald-500/25"
                          : isCurrent
                          ? "bg-primary text-primary-foreground ring-primary shadow-lg shadow-primary/25"
                          : "bg-muted text-muted-foreground ring-muted"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </button>
                  <span
                    className={`text-xs font-medium text-center whitespace-nowrap transition-colors duration-300 ${
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-emerald-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className="flex-1 mx-3 mt-[-1.5rem]">
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-in-out"
                        style={{ width: isCompleted ? "100%" : "0%" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
                <Label>Môn học</Label>
                {effectiveSubject ? (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-muted/50">
                    <Badge variant="secondary">{effectiveSubject}</Badge>
                    <span className="text-xs text-muted-foreground">Tự động từ lớp đã chọn</span>
                  </div>
                ) : examInfo.classIds.length > 0 ? (
                  <p className="text-sm text-amber-600">Các lớp đã chọn thuộc nhiều môn khác nhau. Vui lòng chọn môn:</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Chọn lớp tham gia để tự động xác định môn học</p>
                )}
                {!effectiveSubject && examInfo.classIds.length > 0 && (
                  <Select value={examInfo.subject} onValueChange={(v) => setExamInfo({ ...examInfo, subject: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...new Set(classList.map((c) => c.subject).filter(Boolean))].map((subj) => (
                        <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* ── Class Picker (multi-select via checkboxes) ─────────────── */}
            <div className="space-y-2">
              <Label>Lớp tham gia</Label>
              {classList.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Không tìm thấy lớp nào. Vui lòng tạo lớp trước.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {classList.map((cls) => {
                    const checked = examInfo.classIds.includes(cls.id);
                    return (
                      <label
                        key={cls.id}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          checked
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-accent/50"
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleClassId(cls.id)}
                        />
                        <span className="text-sm font-medium truncate">{cls.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              {examInfo.classIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {examInfo.classIds.map((id) => {
                    const cls = classList.find((c) => c.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {cls?.name ?? `Lớp ${id}`}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Thời gian (phút) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={examInfo.duration}
                  onChange={(e) => setExamInfo({ ...examInfo, duration: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Số lần làm tối đa</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  value={examInfo.maxAttempts}
                  onChange={(e) => setExamInfo({ ...examInfo, maxAttempts: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingScore">Điểm đạt (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={examInfo.passingScore}
                  onChange={(e) => setExamInfo({ ...examInfo, passingScore: parseInt(e.target.value) || 0 })}
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
                    onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 0 })}
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
                  <p className="font-semibold">{effectiveSubject}</p>
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

              {examInfo.classIds.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lớp tham gia</p>
                  <div className="flex flex-wrap gap-1.5">
                    {examInfo.classIds.map((id) => {
                      const cls = classList.find((c) => c.id === id);
                      return <Badge key={id} variant="secondary">{cls?.name ?? `Lớp ${id}`}</Badge>;
                    })}
                  </div>
                </div>
              )}

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

      {/* ── Navigation Buttons ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
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
              onClick={() => {
                if (step === 1 && !step1Valid) {
                  toast.error("Vui lòng điền tên bài thi, môn học và thời gian.");
                  return;
                }
                setStep(step + 1);
              }}
              className="gap-2"
            >
              Tiếp theo
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setPublishDialogOpen(true)}
              disabled={questions.length === 0 || isMutating}
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
            <AlertDialogCancel disabled={isMutating}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish} disabled={isMutating}>
              {isMutating ? "Đang xử lý..." : "Xuất bản"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
