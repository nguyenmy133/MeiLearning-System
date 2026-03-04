import type {
    TeacherExam,
    CreateExamDTO,
    UpdateExamDTO,
    ExamQueryParams,
    ExamStats,
} from "../types";
import { EXAM_DELETABLE_STATUSES, EXAM_IMMUTABLE_STATUSES } from "../types";
import { mockExams } from "../data/mockData";

const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

let db: TeacherExam[] = clone(mockExams);
let nextId = Math.max(...db.map((e) => e.id)) + 1;

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * Get exams for a teacher.
 * Phase 2: GET /api/teacher/exams?classId=&status=&search=
 */
export async function getTeacherExams(
    teacherId: number,
    params?: ExamQueryParams
): Promise<TeacherExam[]> {
    await randomDelay();
    let result = clone(db).filter((e: TeacherExam) => e.teacherId === teacherId);

    if (params?.search) {
        const q = params.search.toLowerCase();
        result = result.filter((e: TeacherExam) => e.title.toLowerCase().includes(q));
    }
    if (params?.status && params.status !== "all") {
        result = result.filter((e: TeacherExam) => e.status === params.status);
    }
    if (params?.classId) {
        result = result.filter((e: TeacherExam) => e.classIds.includes(params.classId!));
    }
    return result;
}

export async function getExamById(id: number, teacherId: number): Promise<TeacherExam> {
    await randomDelay();
    const exam = db.find((e) => e.id === id);
    if (!exam) throw new Error("Không tìm thấy bài thi");
    if (exam.teacherId !== teacherId) throw new Error("Bạn không có quyền xem bài thi này");
    return clone(exam);
}

/**
 * Compute aggregate stats.
 * Phase 2: GET /api/teacher/exams/stats
 */
export async function getExamStats(teacherId: number): Promise<ExamStats> {
    await randomDelay();
    const exams = db.filter((e) => e.teacherId === teacherId);
    const endedExams = exams.filter((e) => e.status === "ended");
    return {
        total: exams.length,
        draft: exams.filter((e) => e.status === "draft").length,
        ongoing: exams.filter((e) => e.status === "ongoing").length,
        ended: endedExams.length,
        averagePassRate:
            endedExams.length > 0
                ? Math.round(endedExams.reduce((acc, e) => acc + e.passRate, 0) / endedExams.length)
                : 0,
    };
}

/**
 * Create a new exam (always starts as draft).
 * Phase 2: POST /api/teacher/exams
 */
export async function createExam(teacherId: number, dto: CreateExamDTO): Promise<TeacherExam> {
    await randomDelay();
    const now = new Date().toISOString();
    const exam: TeacherExam = {
        id: nextId++,
        teacherId,
        ...dto,
        classNames: [], // populated by BE join
        status: "draft",
        totalStudents: 0,
        completedStudents: 0,
        averageScore: 0,
        passRate: 0,
        createdAt: now,
        updatedAt: now,
    };
    db.push(exam);
    return clone(exam);
}

/**
 * Update exam — blocked for ended/archived exams.
 * Phase 2: PUT /api/teacher/exams/{id}
 */
export async function updateExam(
    id: number,
    teacherId: number,
    dto: UpdateExamDTO
): Promise<TeacherExam> {
    await randomDelay();

    const idx = db.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Không tìm thấy bài thi");
    if (db[idx].teacherId !== teacherId) throw new Error("Bạn không có quyền chỉnh sửa bài thi này");
    if (EXAM_IMMUTABLE_STATUSES.includes(db[idx].status)) {
        throw new Error("Bài thi đã kết thúc. Không thể chỉnh sửa.");
    }

    db[idx] = { ...db[idx], ...dto, updatedAt: new Date().toISOString() };
    return clone(db[idx]);
}

/**
 * Delete exam — ONLY allowed for 'draft' status.
 * Exams with status 'ended' or 'archived' cannot be deleted (data integrity).
 * Phase 2: DELETE /api/teacher/exams/{id}
 */
export async function deleteExam(id: number, teacherId: number): Promise<void> {
    await randomDelay();

    const exam = db.find((e) => e.id === id);
    if (!exam) throw new Error("Không tìm thấy bài thi");
    if (exam.teacherId !== teacherId) throw new Error("Bạn không có quyền xóa bài thi này");
    if (!EXAM_DELETABLE_STATUSES.includes(exam.status)) {
        throw new Error(
            `Chỉ được xóa bài thi ở trạng thái "Nháp". Bài thi đang ở trạng thái "${exam.status}".`
        );
    }

    db = db.filter((e) => e.id !== id);
}

/**
 * Archive an ended exam (soft-delete equivalent).
 * Phase 2: PUT /api/teacher/exams/{id}/archive
 */
export async function archiveExam(id: number, teacherId: number): Promise<TeacherExam> {
    return updateExam(id, teacherId, { status: "archived" });
}

export function resetExamData(): void {
    db = clone(mockExams);
    nextId = Math.max(...db.map((e) => e.id)) + 1;
}
