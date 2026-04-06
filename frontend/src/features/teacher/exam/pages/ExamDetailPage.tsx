import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  BookOpen,
  BarChart3,
  Edit3,
  Save,
  Lock,
  Eye,
  Award,
  HelpCircle,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import { useExamDetail, useUpdateExam } from "../hooks";
import type { QuestionOption } from "../types";
import { formatDateTime } from "@/lib/dateUtils";

export function ExamDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const examId = Number(id);

  const { data: exam, isLoading } = useExamDetail(examId);
  const updateExam = useUpdateExam();

  // Inline edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editStartTime, setEditStartTime] = useState<Date | undefined>(undefined);
  const [editEndTime, setEditEndTime] = useState<Date | undefined>(undefined);

  const isDraft = exam?.status === "draft";
  const isEndedOrArchived = exam?.status === "ended" || exam?.status === "archived";

  const handleStartEdit = () => {
    if (!exam) return;
    setEditTitle(exam.title);
    setEditDuration(String(exam.duration));
    setEditStartTime(exam.startTime ? new Date(exam.startTime) : undefined);
    setEditEndTime(exam.endTime ? new Date(exam.endTime) : undefined);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!exam) return;
    updateExam.mutate(
      {
        id: exam.id,
        data: {
          title: editTitle,
          duration: Number(editDuration),
          startTime: editStartTime ? editStartTime.toISOString() : undefined,
          endTime: editEndTime ? editEndTime.toISOString() : undefined,
        },
      },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, JSX.Element> = {
      draft: <Badge variant="secondary">Nháp</Badge>,
      published: <Badge className="bg-primary text-primary-foreground">Đã xuất bản</Badge>,
      ongoing: <Badge className="bg-amber-500 text-white">Đang diễn ra</Badge>,
      ended: <Badge className="bg-muted text-muted-foreground">Đã kết thúc</Badge>,
      archived: <Badge variant="outline">Đã lưu trữ</Badge>,
    };
    return map[status] ?? null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-muted-foreground">Không tìm thấy bài thi.</p>
        <Button variant="outline" onClick={() => navigate("/teacher/exams")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  // Parse options from JSON string
  const parseOptions = (optStr?: string): QuestionOption[] => {
    if (!optStr) return [];
    try { return JSON.parse(optStr); } catch { return []; }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/teacher/exams")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-2xl font-bold h-auto text-foreground"
              />
            ) : (
              <h1 className="text-2xl font-bold text-foreground">{exam.title}</h1>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="secondary">{exam.subject}</Badge>
              {exam.classNames?.map((cls, i) => (
                <Badge key={i} variant="outline">{cls}</Badge>
              ))}
              {getStatusBadge(exam.status)}
            </div>
          </div>
        </div>

        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          {/* Draft: Sửa cấu hình + Quản lý câu hỏi */}
          {isDraft && !isEditing && (
            <>
              <Button variant="outline" onClick={handleStartEdit} className="gap-2">
                <Edit3 className="w-4 h-4" />
                Sửa cấu hình
              </Button>
              <Button
                onClick={() => navigate(`/teacher/exams/edit/${exam.id}`)}
                className="gap-2"
              >
                <ListChecks className="w-4 h-4" />
                Quản lý câu hỏi
              </Button>
            </>
          )}

          {/* Published: chỉ sửa config */}
          {!isDraft && !isEndedOrArchived && (
            isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Hủy</Button>
                <Button onClick={handleSaveEdit} disabled={updateExam.isPending} className="gap-2">
                  <Save className="w-4 h-4" />
                  {updateExam.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleStartEdit} className="gap-2">
                <Edit3 className="w-4 h-4" />
                Sửa cấu hình
              </Button>
            )
          )}

          {/* Draft đang edit: Save/Cancel */}
          {isDraft && isEditing && (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Hủy</Button>
              <Button onClick={handleSaveEdit} disabled={updateExam.isPending} className="gap-2">
                <Save className="w-4 h-4" />
                {updateExam.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </>
          )}

          {isEndedOrArchived && (
            <Button variant="outline" size="sm" className="gap-2 text-muted-foreground" disabled>
              <Lock className="w-4 h-4" />
              Chỉ xem
            </Button>
          )}
          {exam.status !== "draft" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(`/teacher/exams/results/${exam.id}`)}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Kết quả
            </Button>
          )}
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{exam.totalQuestions}</p>
              <p className="text-xs text-muted-foreground">Số câu hỏi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              {isEditing ? (
                <Input
                  type="number"
                  min={1}
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  onBlur={(e) => { const v = String(parseInt(e.target.value) || 1); setEditDuration(v); }}
                  className="h-8 w-24 text-lg font-bold"
                />
              ) : (
                <p className="text-2xl font-bold">{exam.duration}</p>
              )}
              <p className="text-xs text-muted-foreground">Phút làm bài</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {exam.completedStudents}/{exam.totalStudents}
              </p>
              <p className="text-xs text-muted-foreground">Đã nộp bài</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-500">
                {exam.averageScore > 0 ? exam.averageScore.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Điểm TB</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Lịch thi ─────────────────────────────────────────────── */}
      {!isEditing && (exam.startTime || exam.endTime) && (
        <Card className="bg-muted/30">
          <CardContent className="py-3 px-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              {exam.startTime ? formatDateTime(exam.startTime) : "—"}
              {" → "}
              {exam.endTime ? formatDateTime(exam.endTime) : "—"}
            </span>
          </CardContent>
        </Card>
      )}

      {/* ── Time config (editable) ──────────────────────────────────── */}
      {isEditing && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Chỉnh sửa cấu hình
              {!isDraft && (
                <Badge variant="outline" className="ml-2 text-xs gap-1">
                  <Lock className="w-3 h-3" />
                  Câu hỏi bị khoá (đã xuất bản)
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Thời gian mở</Label>
                <DateTimePicker
                  value={editStartTime}
                  onChange={(d) => {
                    setEditStartTime(d);
                    if (d && editEndTime && editEndTime <= d) setEditEndTime(undefined);
                  }}
                  placeholder="Chọn ngày & giờ mở"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Thời gian đóng</Label>
                <DateTimePicker
                  value={editEndTime}
                  onChange={setEditEndTime}
                  placeholder="Chọn ngày & giờ đóng"
                  fromDate={editStartTime ?? new Date()}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Tabs: Câu hỏi / Kết quả ─────────────────────────────────── */}
      <Tabs defaultValue="questions">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="questions" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Câu hỏi ({exam.totalQuestions})
            </TabsTrigger>
            {exam.status !== "draft" && (
              <TabsTrigger value="results" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Kết quả ({exam.completedStudents})
              </TabsTrigger>
            )}
          </TabsList>

          {/* Draft: nút Quản lý câu hỏi ngay cạnh tab */}
          {isDraft && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate(`/teacher/exams/edit/${exam.id}`)}
            >
              <ListChecks className="w-4 h-4" />
              Thêm / sửa câu hỏi
            </Button>
          )}
        </div>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4 pt-4">
          {!exam.questions || exam.questions.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Bài thi chưa có câu hỏi nào.</p>
                {isDraft && (
                  <Button
                    className="mt-4 gap-2"
                    onClick={() => navigate(`/teacher/exams/edit/${exam.id}`)}
                  >
                    <Edit3 className="w-4 h-4" />
                    Thêm câu hỏi
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            exam.questions.map((q, idx) => {
              const options = parseOptions(q.options);
              return (
                <Card key={q.id ?? idx} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{idx + 1}</span>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-foreground leading-relaxed">
                            {q.question}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {q.type === "multiple-choice" ? "Trắc nghiệm" : "Tự luận"}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {q.points} điểm
                            </Badge>
                          </div>
                        </div>

                        {q.type === "multiple-choice" && options.length > 0 && (
                          <div className="grid sm:grid-cols-2 gap-2">
                            {options.map((opt) => {
                              const isCorrect = opt.id === q.correctAnswer;
                              return (
                                <div
                                  key={opt.id}
                                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-colors ${
                                    isCorrect
                                      ? "border-emerald-500 bg-emerald-500/10"
                                      : "border-border bg-muted/30"
                                  }`}
                                >
                                  {isCorrect ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                                  )}
                                  <span className="font-medium w-5">
                                    {opt.id.toUpperCase()}.
                                  </span>
                                  <span className={isCorrect ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-foreground"}>
                                    {opt.text}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.explanation && (
                          <>
                            <Separator />
                            <p className="text-xs text-muted-foreground italic">
                              💡 Giải thích: {q.explanation}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Results Tab */}
        {exam.status !== "draft" && (
          <TabsContent value="results" className="pt-4">
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <Eye className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Xem chi tiết kết quả từng học viên trong trang Kết quả
                </p>
                <Button
                  onClick={() => navigate(`/teacher/exams/results/${exam.id}`)}
                  className="gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Xem trang kết quả
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
