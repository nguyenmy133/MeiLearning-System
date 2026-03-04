export interface ExamScore {
    examId: number;
    examTitle: string;
    score: number;        // 0-10
    passed: boolean;
    date: string;
}

export interface StudentGrade {
    id: number;
    studentId: string;
    name: string;
    avatar?: string;
    examScores: ExamScore[];
    avgScore: number;
    trend: "up" | "down" | "stable";
    attendanceRate: number;     // 0-100 %
    comment: string;
    commentUpdatedAt?: string;
}

export interface GradeQueryParams {
    classId?: number;
    examId?: number;
    search?: string;
}

export interface UpdateCommentDTO {
    studentId: string;
    classId: number;
    comment: string;
}

export interface GradeStats {
    totalStudents: number;
    averageScore: number;
    passRate: number;
    averageAttendance: number;
}
