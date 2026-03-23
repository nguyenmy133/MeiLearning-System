// ─── Grade Types (User-facing) ────────────────────────────────────────────────
// Grades are AUTO-generated from exam results (no manual entry by Teacher).
// Teacher can only add/update comments.

export interface ExamScoreEntry {
    examId: string;
    examTitle: string;
    score: number;   // 0-10
    passed: boolean;
    date: string;    // "YYYY-MM-DD" (exam end time, fallback)
    submittedAt: string; // ISO datetime of student submission
    /** no_essay | pending | graded */
    gradingStatus: "no_essay" | "pending" | "graded";
}

export interface ClassGrade {
    classId: string;
    className: string;
    subject: string;
    teacherName: string;
    examScores: ExamScoreEntry[];
    avgScore: number;
    trend: "up" | "down" | "stable";
    attendanceRate: number;   // 0-100 (%)
    /** Comment left by Teacher */
    teacherComment?: string;
    commentUpdatedAt?: string;
    /** Status of the class — determines if grades are "final" */
    classStatus: "active" | "completed";
}
