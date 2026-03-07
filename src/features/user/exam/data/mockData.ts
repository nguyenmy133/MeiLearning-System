import type { ExamDetail, ExamResult } from "../types";

export const MOCK_EXAMS: ExamDetail[] = [
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

export const MOCK_RESULTS: Record<string, ExamResult> = {
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
