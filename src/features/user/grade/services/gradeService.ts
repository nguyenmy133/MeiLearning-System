import type { ClassGrade } from "../types";

const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_GRADES: ClassGrade[] = [
    {
        classId: "class-toan-10a",
        className: "Toán 10A",
        subject: "Toán",
        teacherName: "Thầy Nguyễn Văn An",
        classStatus: "ACTIVE",
        examScores: [
            {
                examId: "exam-003",
                examTitle: "Quiz – Chương 1",
                score: 6.5,
                passed: true,
                date: "2026-02-17",
            },
        ],
        avgScore: 6.5,
        trend: "stable",
        attendanceRate: 85,
        teacherComment: "Học viên cần ôn luyện thêm phần đại số. Có tiến bộ ở buổi sau.",
        commentUpdatedAt: "2026-03-01T09:00:00Z",
    },
    {
        classId: "class-anh-10a",
        className: "Tiếng Anh 10A",
        subject: "Tiếng Anh",
        teacherName: "Cô Trần Thị Bình",
        classStatus: "ACTIVE",
        examScores: [
            {
                examId: "exam-002",
                examTitle: "Mini Test – Unit 3",
                score: 8.0,
                passed: true,
                date: "2026-03-04",
            },
        ],
        avgScore: 8.0,
        trend: "up",
        attendanceRate: 100,
        teacherComment: "Rất tích cực và nỗ lực. Phát âm cần cải thiện thêm.",
        commentUpdatedAt: "2026-03-05T10:00:00Z",
    },
    {
        // Completed class — grades are final (read-only history for 1 year)
        classId: "class-ly-9b",
        className: "Vật Lý 9B",
        subject: "Vật Lý",
        teacherName: "Thầy Lê Minh Cường",
        classStatus: "COMPLETED",
        examScores: [
            {
                examId: "exam-ly-1",
                examTitle: "Kiểm tra cuối kỳ",
                score: 7.5,
                passed: true,
                date: "2025-12-20",
            },
        ],
        avgScore: 7.5,
        trend: "up",
        attendanceRate: 92,
        teacherComment: "Hoàn thành khóa học tốt. Chúc mừng!",
        commentUpdatedAt: "2025-12-31T08:00:00Z",
    },
];

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Get grade overview across all classes (active + completed).
 * Phase 2: GET /api/user/grades
 */
export async function getMyGrades(): Promise<ClassGrade[]> {
    await randomDelay();
    return clone(MOCK_GRADES);
}

/**
 * Get grade detail for a specific class.
 * Phase 2: GET /api/user/grades/{classId}
 * Works for both ACTIVE and COMPLETED classes.
 */
export async function getMyGradeByClass(classId: string): Promise<ClassGrade> {
    await randomDelay();
    const grade = MOCK_GRADES.find((g) => g.classId === classId);
    if (!grade) throw new Error("Không tìm thấy kết quả học tập cho lớp này.");
    return clone(grade);
}
