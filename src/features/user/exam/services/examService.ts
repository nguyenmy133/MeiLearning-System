import type { ExamDetail, ExamSession, ExamResult, SubmitExamDTO } from "../types";

const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_EXAMS: ExamDetail[] = [
    {
        id: "exam-001",
        classId: "class-toan-10a",
        className: "Toán 10A",
        title: "Kiểm tra giữa kỳ – Đại số",
        description: "Chương 1 & 2: Hàm số và đồ thị",
        startAt: "2026-03-15T18:00:00Z",
        durationMinutes: 45,
        totalQuestions: 20,
        status: "upcoming",
    },
    {
        id: "exam-002",
        classId: "class-anh-10a",
        className: "Tiếng Anh 10A",
        title: "Mini Test – Unit 3",
        startAt: "2026-03-04T08:00:00Z",
        durationMinutes: 30,
        totalQuestions: 15,
        status: "completed",
        score: 8.0,
        passed: true,
        submittedAt: "2026-03-04T08:28:00Z",
    },
    {
        id: "exam-003",
        classId: "class-toan-10a",
        className: "Toán 10A",
        title: "Quiz – Chương 1",
        startAt: "2026-02-17T18:00:00Z",
        durationMinutes: 20,
        totalQuestions: 10,
        status: "completed",
        score: 6.5,
        passed: true,
        submittedAt: "2026-02-17T18:19:00Z",
    },
];

const MOCK_RESULTS: Record<string, ExamResult> = {
    "exam-002": {
        examId: "exam-002",
        examTitle: "Mini Test – Unit 3",
        classId: "class-anh-10a",
        className: "Tiếng Anh 10A",
        score: 8.0,
        maxScore: 10,
        passed: true,
        correctCount: 12,
        totalQuestions: 15,
        submittedAt: "2026-03-04T08:28:00Z",
        breakdown: [
            { questionId: 1, correct: true, selectedOption: 1, correctOption: 1 },
            { questionId: 2, correct: true, selectedOption: 2, correctOption: 2 },
            { questionId: 3, correct: false, selectedOption: 0, correctOption: 3 },
        ],
    },
};

let examDb: ExamDetail[] = clone(MOCK_EXAMS);

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Get all exams available to the current user.
 * Phase 2: GET /api/user/exams
 */
export async function getMyExams(): Promise<ExamDetail[]> {
    await randomDelay();
    return clone(examDb).sort(
        (a: ExamDetail, b: ExamDetail) =>
            new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
    );
}

/**
 * Get exam detail and questions for taking the exam.
 * Phase 2: GET /api/user/exams/{id}/start
 * BE checks: user is enrolled in the class + exam window is open.
 */
export async function startExam(examId: string): Promise<ExamSession> {
    await randomDelay();
    const exam = examDb.find((e) => e.id === examId);
    if (!exam) throw new Error("Không tìm thấy bài thi.");
    if (exam.status !== "upcoming" && exam.status !== "ongoing") {
        throw new Error("Bài thi này chưa được mở hoặc đã kết thúc.");
    }

    // Mock questions
    return {
        examId,
        remainingSeconds: exam.durationMinutes * 60,
        questions: Array.from({ length: exam.totalQuestions }, (_, i) => ({
            id: i + 1,
            content: `Câu ${i + 1}: Đây là nội dung câu hỏi số ${i + 1}?`,
            options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        })),
    };
}

/**
 * Submit exam answers.
 * Phase 2: POST /api/user/exams/{id}/submit
 * BE: auto-grades → writes ExamResult → marks Exam as completed for this user.
 */
export async function submitExam(dto: SubmitExamDTO): Promise<ExamResult> {
    await randomDelay();
    const examIdx = examDb.findIndex((e) => e.id === dto.examId);
    if (examIdx === -1) throw new Error("Không tìm thấy bài thi.");

    // Mock auto-grading (random for demo)
    const totalQ = examDb[examIdx].totalQuestions;
    const correctCount = Math.floor(Math.random() * (totalQ + 1));
    const score = Math.round((correctCount / totalQ) * 10 * 10) / 10;
    const passed = score >= 5;

    examDb[examIdx] = {
        ...examDb[examIdx],
        status: "completed",
        score,
        passed,
        submittedAt: new Date().toISOString(),
    };

    const result: ExamResult = {
        examId: dto.examId,
        examTitle: examDb[examIdx].title,
        classId: examDb[examIdx].classId,
        className: examDb[examIdx].className,
        score,
        maxScore: 10,
        passed,
        correctCount,
        totalQuestions: totalQ,
        submittedAt: new Date().toISOString(),
        breakdown: [],
    };
    return result;
}

/**
 * Get the result of a completed exam.
 * Phase 2: GET /api/user/exams/{id}/result
 */
export async function getExamResult(examId: string): Promise<ExamResult> {
    await randomDelay();
    const result = MOCK_RESULTS[examId];
    if (!result) throw new Error("Chưa có kết quả cho bài thi này.");
    return clone(result);
}
