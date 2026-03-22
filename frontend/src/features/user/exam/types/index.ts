// ─── Exam Types (User-facing) ─────────────────────────────────────────────────

export type ExamStatus = "upcoming" | "ongoing" | "completed" | "missed";

export interface ExamQuestion {
    id: number;
    type: "multiple-choice" | "essay";
    content: string;
    options: string[];   // A, B, C, D — rỗng nếu essay
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
    /** Student-specific: populated from backend list */
    mySubmittedAt?: string;
    myScore?: number;
    myPassed?: boolean;
    /** Thời gian thực tế đã làm bài (phút) */
    myTimeSpent?: number;
    /** Trạng thái chấm tự luận: "graded" | "pending" | "no_essay" */
    myGradingStatus?: "graded" | "pending" | "no_essay";
}

export interface ExamSession {
    examId: string;
    questions: ExamQuestion[];
    /** Remaining time in seconds (Phase 2: from BE countdown) */
    remainingSeconds: number;
}

export interface SubmitExamDTO {
    examId: string;
    /** key = questionId, value = optionIndex (MC) hoặc text (essay) */
    answers: Record<number, number | string>;
    /** Thời gian thực tế đã làm bài (phút) */
    timeSpentMinutes?: number;
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
    id: number;
    questionId: number;
    questionType?: string;          // "multiple-choice" | "essay"
    selectedAnswer: string;         // "a"/"b"/... hoặc text tự luận
    correctAnswer: string;          // "a"/"b"/... (null cho essay)
    isCorrect: boolean;
    essayScore?: number;            // điểm teacher chấm (null = chưa chấm)
    maxPoints?: number;             // điểm tối đa của câu hỏi
    teacherComment?: string;        // nhận xét của teacher
}
