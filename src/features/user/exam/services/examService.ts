import type { ExamDetail, ExamSession, ExamResult, SubmitExamDTO } from "../types";

const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

import { MOCK_EXAMS, MOCK_RESULTS } from "../data/mockData";

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
