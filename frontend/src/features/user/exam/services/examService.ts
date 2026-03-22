import { apiClient } from "@/lib/api-client";
import type { ExamDetail, ExamSession, ExamQuestion, ExamResult, ExamAnswerDetail } from "../types";

// ── Mapper: Backend ExamResponse → Frontend ExamDetail ──────────────────────

function mapExamStatus(raw: any): ExamDetail["status"] {
  const now = Date.now();
  const start = raw.startTime ? new Date(raw.startTime).getTime() : 0;
  const end = raw.endTime ? new Date(raw.endTime).getTime() : 0;
  // Student đã nộp bài → completed
  if (raw.mySubmittedAt) return "completed";
  if (raw.submittedCount > 0) return "completed";
  // Backend now returns dynamic status: "upcoming", "ongoing", "ended", "published", "draft"
  const backendStatus = raw.status;
  if (backendStatus === "draft") return "missed"; // student shouldn't see drafts
  if (backendStatus === "ended" || (end > 0 && now > end)) return "missed";
  if (backendStatus === "ongoing" || (start > 0 && now >= start && (end === 0 || now <= end))) return "ongoing";
  if (backendStatus === "upcoming" || (start > 0 && now < start)) return "upcoming";
  // Fallback for "published" without time set
  return "upcoming";
}

function mapExamResponse(raw: any): ExamDetail {
  return {
    id: String(raw.id),
    classId: raw.classIds?.[0] != null ? String(raw.classIds[0]) : "",
    className: raw.classNames?.[0] ?? raw.subject ?? "",
    title: raw.title ?? "",
    description: raw.description ?? undefined,
    startAt: raw.startTime ?? "",
    endAt: raw.endTime ?? undefined,
    durationMinutes: raw.duration ?? raw.myDurationMinutes ?? 0,
    totalQuestions: raw.totalQuestions ?? 0,
    status: mapExamStatus(raw),
    score: raw.myScore ?? raw.avgScore ?? undefined,
    passed: raw.myPassed ?? undefined,
    submittedAt: raw.mySubmittedAt ?? undefined,
    mySubmittedAt: raw.mySubmittedAt ?? undefined,
    myScore: raw.myScore ?? undefined,
    myPassed: raw.myPassed ?? undefined,
    myTimeSpent: raw.myTimeSpent ?? undefined,
    myGradingStatus: raw.myGradingStatus ?? undefined,
  };
}

/**
 * Parse options from backend format.
 * Backend stores options as JSON string: '[{"id":"a","text":"..."}, ...]' or '["opt1","opt2"]'
 */
function parseOptions(rawOpts: any): string[] {
  if (Array.isArray(rawOpts)) {
    return rawOpts.map((item: any) =>
      typeof item === "string" ? item : item.text ?? item.label ?? String(item)
    );
  }
  if (typeof rawOpts === "string") {
    try {
      const parsed = JSON.parse(rawOpts);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) =>
          typeof item === "string" ? item : item.text ?? item.label ?? String(item)
        );
      }
    } catch {
      return rawOpts.split("\n").filter(Boolean);
    }
  }
  return [];
}

/**
 * Map backend QuestionResponse → frontend ExamQuestion.
 * Backend: { id, orderIndex, type, question, options (JSON), correctAnswer, points, explanation }
 * Frontend: { id, content, options: string[], correctIndex?, explanation? }
 */
function mapQuestion(raw: any): ExamQuestion {
  const opts = parseOptions(raw.options);

  // Resolve correctAnswer to 0-based index
  let correctIndex: number | undefined;
  const correctAns = (raw.correctAnswer ?? "").toLowerCase().trim();
  if (correctAns) {
    // Try to match structured options [{id:"a",...}, ...]
    if (typeof raw.options === "string") {
      try {
        const parsed = JSON.parse(raw.options);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0].id) {
          const idx = parsed.findIndex((o: any) => String(o.id).toLowerCase() === correctAns);
          if (idx >= 0) correctIndex = idx;
        }
      } catch { /* ignore */ }
    }
    // Fallback: letter a=0, b=1, ...
    if (correctIndex === undefined) {
      const letterIdx = correctAns.charCodeAt(0) - 97;
      if (letterIdx >= 0 && letterIdx < opts.length) {
        correctIndex = letterIdx;
      } else {
        const numIdx = parseInt(correctAns);
        if (!isNaN(numIdx) && numIdx >= 0) correctIndex = numIdx;
      }
    }
  }

  return {
    id: raw.id,
    type: raw.type === "essay" ? "essay" : "multiple-choice",
    content: raw.question ?? raw.questionText ?? raw.content ?? "",
    options: opts,
    correctIndex,
    explanation: raw.explanation ?? undefined,
  };
}

// ── API Functions ───────────────────────────────────────────────────────────

/** Get all exams visible to current student */
export async function getMyExams(): Promise<ExamDetail[]> {
  const { data } = await apiClient.get("/exams");
  const list = data?.data ?? data?.content ?? (Array.isArray(data) ? data : []);
  return list.map(mapExamResponse);
}

/** Get exam detail — used by ExamTaking for header info */
export async function startExam(examId: string): Promise<ExamDetail> {
  const { data } = await apiClient.get(`/exams/${examId}`);
  return mapExamResponse(data);
}

/**
 * Get exam data (info + session) in a single API call.
 * Uses /for-student endpoint → questions have correctAnswer + explanation stripped.
 */
export async function getExamData(examId: string): Promise<{ examInfo: ExamDetail; session: ExamSession }> {
  const { data: raw } = await apiClient.get(`/exams/${examId}/for-student`);

  const examInfo = mapExamResponse(raw);

  const rawQuestions = raw.questions ?? [];
  const questions: ExamQuestion[] = rawQuestions
    .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    .map(mapQuestion);

  // Calculate remaining time
  let remainingSeconds = (raw.duration ?? 0) * 60;
  if (raw.startTime) {
    const startMs = new Date(raw.startTime).getTime();
    const elapsed = Math.floor((Date.now() - startMs) / 1000);
    remainingSeconds = Math.max(0, (raw.duration ?? 0) * 60 - elapsed);
  }

  return {
    examInfo,
    session: {
      examId: String(raw.id),
      questions,
      remainingSeconds,
    },
  };
}

/**
 * Submit exam — gửi chi tiết câu trả lời lên backend để chấm điểm.
 *
 * Backend tự chấm điểm, lưu chi tiết từng câu vào bảng exam_answer_details.
 *
 * @param answers — key = questionId, value = selected option index (0-based)
 */
export async function submitExam(
  examId: string,
  answers: Record<number, number | string>,
  timeSpent?: number,
): Promise<ExamResult> {
  // Chuyển đổi: MC {questionId: optionIndex} → {questionId, selectedAnswer: "a"/"b"/...}
  //           Essay {questionId: text} → {questionId, selectedAnswer: text}
  const answerItems = Object.entries(answers).map(([qId, val]) => ({
    questionId: Number(qId),
    selectedAnswer: typeof val === "number"
      ? String.fromCharCode(97 + val) // 0→"a", 1→"b", 2→"c", 3→"d"
      : String(val),                   // essay: raw text
  }));

  const { data } = await apiClient.post(`/exams/${examId}/submit`, {
    answers: answerItems,
    timeSpent: timeSpent ?? 0,
  });

  return {
    examId: String(data.examId ?? examId),
    examTitle: data.examTitle ?? "",
    classId: "",
    className: "",
    score: data.score ?? 0,
    maxScore: 100,
    passed: data.passed ?? false,
    correctCount: data.correctAnswers ?? 0,
    totalQuestions: data.totalQuestions ?? 0,
    submittedAt: data.submittedAt ?? new Date().toISOString(),
    breakdown: [],
  };
}

/** Get exam result — student xem kết quả của chính mình (resolve từ JWT) */
export async function getExamResult(examId: string): Promise<ExamResult> {
  const { data } = await apiClient.get(`/exams/${examId}/my-result`);
  if (!data) throw new Error("Chưa có kết quả");

  return {
    examId: String(data.examId ?? examId),
    examTitle: data.examTitle ?? "",
    classId: "",
    className: "",
    score: data.score ?? 0,
    maxScore: 100,
    passed: data.passed ?? false,
    correctCount: data.correctAnswers ?? 0,
    totalQuestions: data.totalQuestions ?? 0,
    submittedAt: data.submittedAt ?? "",
    breakdown: [],
  };
}

/** Get per-question answer details — student xem chi tiết bài làm */
export async function getMyAnswers(examId: string): Promise<ExamAnswerDetail[]> {
  const { data } = await apiClient.get(`/exams/${examId}/my-answers`);
  if (!Array.isArray(data)) return [];
  return data.map((item: any) => ({
    id: item.id,
    questionId: item.questionId,
    questionType: item.questionType ?? undefined,
    selectedAnswer: item.selectedAnswer ?? "",
    correctAnswer: item.correctAnswer ?? "",
    isCorrect: item.isCorrect ?? false,
    essayScore: item.essayScore ?? undefined,
    maxPoints: item.maxPoints ?? undefined,
    teacherComment: item.teacherComment ?? undefined,
  }));
}
