export type ExamStatus = "draft" | "published" | "ongoing" | "ended" | "archived";
export type QuestionType = "multiple_choice" | "true_false" | "short_answer";

export interface TeacherExam {
    id: number;
    teacherId: number;
    title: string;
    subject: string;
    classIds: number[];
    classNames: string[];
    duration: number;           // minutes
    totalQuestions: number;
    startTime: string;          // ISO datetime or empty string for draft
    endTime: string;
    status: ExamStatus;
    totalStudents: number;
    completedStudents: number;
    averageScore: number;       // 0-100
    passRate: number;           // 0-100
    createdAt: string;
    updatedAt: string;
}

export interface CreateExamDTO {
    title: string;
    subject: string;
    classIds: number[];
    duration: number;
    startTime?: string;
    endTime?: string;
}

export interface UpdateExamDTO {
    title?: string;
    subject?: string;
    classIds?: number[];
    duration?: number;
    startTime?: string;
    endTime?: string;
    status?: ExamStatus;
}

export interface ExamQueryParams {
    search?: string;
    status?: ExamStatus | "all";
    classId?: number;
}

export interface ExamStats {
    total: number;
    draft: number;
    ongoing: number;
    ended: number;
    averagePassRate: number;
}

export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
    draft: "Nháp",
    published: "Đã xuất bản",
    ongoing: "Đang diễn ra",
    ended: "Đã kết thúc",
    archived: "Đã lưu trữ",
};

/** Statuses that are immutable (cannot edit/delete) */
export const EXAM_IMMUTABLE_STATUSES: ExamStatus[] = ["ended", "archived"];
/** Only draft can be deleted */
export const EXAM_DELETABLE_STATUSES: ExamStatus[] = ["draft"];

export interface ExamInfo {
    id: number;
    title: string;
    subject: string;
    classes: string[];
    totalQuestions: number;
    totalPoints: number;
    passingScore: number;
}

export interface ExamStatistics {
    totalStudents: number;
    completedStudents: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    passRate: number;
    averageTime: number; // minutes
}

export interface StudentResult {
    id: number;
    studentId: string;
    studentName: string;
    class: string;
    score: number;
    correctAnswers: number;
    timeSpent: number;
    submittedAt: string;
    passed: boolean;
}

export interface QuestionAnalysis {
    questionNumber: number;
    question: string;
    correctRate: number;
    answerDistribution: Record<string, number>;
}
