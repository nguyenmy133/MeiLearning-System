import type { StudentGrade, GradeQueryParams, UpdateCommentDTO, GradeStats } from "../types";
import { mockGrades } from "../data/mockData";

const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

let db: Record<number, StudentGrade[]> = clone(mockGrades);

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * Get grades for a class.
 * Phase 2: GET /api/teacher/grades/{classId}?examId=&search=
 */
export async function getClassGrades(
    classId: number,
    params?: GradeQueryParams
): Promise<StudentGrade[]> {
    await randomDelay();
    let result = clone(db[classId] ?? []);

    if (params?.examId) {
        result = result.map((s: StudentGrade) => ({
            ...s,
            examScores: s.examScores.filter((score) => score.examId === params.examId),
        }));
    }
    if (params?.search) {
        const q = params.search.toLowerCase();
        result = result.filter(
            (s: StudentGrade) =>
                s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q)
        );
    }
    return result;
}

/**
 * Compute grade stats for a class.
 * Phase 2: GET /api/teacher/grades/{classId}/stats
 */
export async function getGradeStats(classId: number): Promise<GradeStats> {
    await randomDelay();
    const students = db[classId] ?? [];
    const withScores = students.filter((s) => s.examScores.length > 0);
    return {
        totalStudents: students.length,
        averageScore:
            withScores.length > 0
                ? Math.round((withScores.reduce((acc, s) => acc + s.avgScore, 0) / withScores.length) * 10) / 10
                : 0,
        passRate:
            withScores.length > 0
                ? Math.round((withScores.filter((s) => s.avgScore >= 5).length / withScores.length) * 100)
                : 0,
        averageAttendance:
            students.length > 0
                ? Math.round(students.reduce((acc, s) => acc + s.attendanceRate, 0) / students.length)
                : 0,
    };
}

/**
 * Update teacher comment for a student.
 * Phase 2: PUT /api/teacher/grades/{studentId}/comment
 */
export async function updateComment(
    _teacherId: number,
    dto: UpdateCommentDTO
): Promise<StudentGrade> {
    await randomDelay();

    const students = db[dto.classId] ?? [];
    const idx = students.findIndex((s) => s.studentId === dto.studentId);
    if (idx === -1) throw new Error("Không tìm thấy học viên");

    db[dto.classId][idx] = {
        ...db[dto.classId][idx],
        comment: dto.comment,
        commentUpdatedAt: new Date().toISOString().split("T")[0],
    };
    return clone(db[dto.classId][idx]);
}

export function resetGradeData(): void {
    db = clone(mockGrades);
}
