import { apiClient } from "@/lib/api-client";
import type { TeacherExam, CreateExamDTO, ExamQueryParams } from "../types";

/**
 * Map ExamResponse (backend) → TeacherExam (frontend type).
 *
 * Backend trả:
 *   { id, title, subject, teacherId, teacherName, duration, totalQuestions,
 *     startTime, endTime, status, classIds, submittedCount, avgScore, createdAt }
 *
 * Frontend cần:
 *   { classNames, completedStudents, totalStudents, averageScore, passRate, ... }
 */
function mapExam(raw: any): TeacherExam {
  return {
    id: raw.id,
    teacherId: raw.teacherId,
    title: raw.title ?? "",
    subject: raw.subject ?? "",
    classIds: raw.classIds ?? [],
    classNames: raw.classNames ?? [],
    duration: raw.duration ?? 0,
    totalQuestions: raw.totalQuestions ?? 0,
    startTime: raw.startTime ?? "",
    endTime: raw.endTime ?? "",
    status: raw.status ?? "draft",
    totalStudents: raw.totalStudents ?? 0,
    completedStudents: raw.submittedCount ?? raw.completedStudents ?? 0,
    averageScore: raw.avgScore ?? raw.averageScore ?? 0,
    passRate: raw.passRate ?? 0,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? raw.createdAt ?? "",
    description: raw.description ?? "",
    questions: raw.questions ?? [],
  };
}

/**
 * Lấy danh sách bài thi của teacher.
 * GET /api/v1/exams?status=&page=&limit=
 * Backend tự filter theo teacher từ JWT.
 */
export async function getTeacherExams(
  params?: ExamQueryParams
): Promise<TeacherExam[]> {
  const { data } = await apiClient.get("/exams", {
    params: { ...params },
  });
  const raw = Array.isArray(data) ? data : (data?.data ?? []);
  return raw.map(mapExam);
}

export async function getExamById(id: number): Promise<TeacherExam> {
  const { data } = await apiClient.get(`/exams/${id}`);
  return mapExam(data);
}

/**
 * Tính stats cục bộ từ list — không gọi endpoint riêng.
 * Backend tự filter theo teacher từ JWT.
 */
export async function getExamStats(): Promise<{ total: number; draft: number; published: number; upcoming: number; ongoing: number; ended: number; archived: number; averagePassRate: number }> {
  try {
    const exams = await getTeacherExams();
    return {
      total: exams.length,
      draft: exams.filter((e) => e.status === "draft").length,
      published: exams.filter((e) => e.status === "published").length,
      upcoming: exams.filter((e) => e.status === "upcoming").length,
      ongoing: exams.filter((e) => e.status === "ongoing").length,
      ended: exams.filter((e) => e.status === "ended").length,
      archived: exams.filter((e) => e.status === "archived").length,
      averagePassRate: 0,
    };
  } catch {
    return { total: 0, draft: 0, published: 0, upcoming: 0, ongoing: 0, ended: 0, archived: 0, averagePassRate: 0 };
  }
}

export async function createExam(dto: CreateExamDTO): Promise<TeacherExam> {
  // Backend tự resolve teacher từ JWT — không cần gửi teacherId
  const { data } = await apiClient.post("/exams", dto);
  return mapExam(data);
}

export async function deleteExam(id: number): Promise<void> {
  await apiClient.delete(`/exams/${id}`);
}

export async function archiveExam(id: number): Promise<TeacherExam> {
  const { data } = await apiClient.patch(`/exams/${id}/archive`);
  return mapExam(data);
}

export async function publishExam(id: number): Promise<TeacherExam> {
  const { data } = await apiClient.patch(`/exams/${id}/publish`);
  return mapExam(data);
}

export async function updateExam(id: number, dto: Partial<import('../types').CreateExamDTO>): Promise<TeacherExam> {
  const { data } = await apiClient.put(`/exams/${id}`, dto);
  return mapExam(data);
}

// ── Exam Results ──────────────────────────────────────────────────────────────

export async function getExamStatistics(examId: number) {
  const { data } = await apiClient.get(`/exams/${examId}/statistics`);
  return data;
}

export async function getStudentResults(examId: number) {
  const { data } = await apiClient.get(`/exams/${examId}/results`);
  return Array.isArray(data) ? data : [];
}

export async function getStudentExamResult(examId: number, studentId: string) {
  const { data } = await apiClient.get(`/exams/${examId}/results/${studentId}`);
  return data;
}

/** Stub — backend chưa có endpoint này. Trả [] để không crash UI. */
export async function getQuestionAnalysis(_examId: number) {
  return [];
}

// ── Essay Grading ─────────────────────────────────────────────────────────────

/** Lấy chi tiết câu trả lời của 1 student cho 1 bài thi */
export async function getStudentAnswerDetails(examId: number, studentId: string) {
  const { data } = await apiClient.get(
    `/exams/${examId}/results/${studentId}/answers`
  );
  return Array.isArray(data) ? data : [];
}

/** Teacher chấm điểm câu tự luận */
export interface EssayGradeItem {
  answerDetailId: number;
  score: number;
  comment: string;
}

export async function gradeEssay(
  examId: number,
  studentId: string,
  grades: EssayGradeItem[]
): Promise<void> {
  await apiClient.put(`/exams/${examId}/results/${studentId}/grade-essay`, {
    grades,
  });
}
