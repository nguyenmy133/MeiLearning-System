// ─── Exam Types (User-facing) ─────────────────────────────────────────────────

export type ExamStatus = "upcoming" | "ongoing" | "completed" | "missed";

export interface ExamQuestion {
    id: number;
    content: string;
    options: string[];   // A, B, C, D
    /** 0-based index of the correct option — only populated in review mode */
    correctIndex?: number;
    /** Explanation for the answer — only populated in review mode */
    explanation?: string;
}

export interface ExamDetail {
    id: string;
    classId: string;
    className: string;
    title: string;
    description?: string;
    startAt: string;     // ISO timestamp
    endAt?: string;      // ISO timestamp — thời gian kết thúc
    durationMinutes: number;
    totalQuestions: number;
    status: ExamStatus;
    /** Score 0-10, available after submission */
    score?: number;
    passed?: boolean;
    submittedAt?: string;
}

export interface ExamSession {
    examId: string;
    questions: ExamQuestion[];
    /** Remaining time in seconds (Phase 2: from BE countdown) */
    remainingSeconds: number;
}

export interface SubmitExamDTO {
    examId: string;
    /** key = questionId, value = answer index (0-3) */
    answers: Record<number, number>;
}

export interface ExamResult {
    examId: string;
    examTitle: string;
    classId: string;
    className: string;
    score: number;
    maxScore: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
    submittedAt: string;
    /** Per-question breakdown */
    breakdown: {
        questionId: number;
        correct: boolean;
        selectedOption: number;
        correctOption: number;
    }[];
}

/** Chi tiết câu trả lời từ backend (GET /exams/{id}/my-answers) */
export interface ExamAnswerDetail {
    questionId: number;
    selectedAnswer: string;   // "a", "b", "c", "d"
    correctAnswer: string;    // "a", "b", "c", "d"
    isCorrect: boolean;
}
