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
    classNames: raw.classNames ?? [],       // backend chưa trả — hiển thị empty
    duration: raw.duration ?? 0,
    totalQuestions: raw.totalQuestions ?? 0,
    startTime: raw.startTime ?? "",
    endTime: raw.endTime ?? "",
    status: raw.status ?? "draft",
    totalStudents: raw.totalStudents ?? raw.submittedCount ?? 0,
    completedStudents: raw.submittedCount ?? raw.completedStudents ?? 0,
    averageScore: raw.avgScore ?? raw.averageScore ?? 0,
    passRate: raw.passRate ?? 0,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? raw.createdAt ?? "",
  };
}

/**
 * Lấy danh sách bài thi của teacher.
 * GET /api/v1/exams?teacherId=&status=&page=&limit=
 */
export async function getTeacherExams(
  teacherId: number,
  params?: ExamQueryParams
): Promise<TeacherExam[]> {
  const { data } = await apiClient.get("/exams", {
    params: { teacherId, ...params },
  });
  const raw = Array.isArray(data) ? data : (data?.data ?? []);
  return raw.map(mapExam);
}

export async function getExamById(id: number): Promise<TeacherExam> {
  const { data } = await apiClient.get(`/exams/${id}`);
  return mapExam(data);
}

/**
 * Tính stats cục bộ từ list — không gọi endpoint riêng (không tồn tại trên BE).
 */
export async function getExamStats(
  teacherId: number
): Promise<{ total: number; draft: number; published: number; ongoing: number; ended: number; archived: number; averagePassRate: number }> {
  try {
    const exams = await getTeacherExams(teacherId);
    return {
      total: exams.length,
      draft: exams.filter((e) => e.status === "draft").length,
      published: exams.filter((e) => e.status === "published").length,
      ongoing: exams.filter((e) => e.status === "ongoing").length,
      ended: exams.filter((e) => e.status === "ended").length,
      archived: exams.filter((e) => e.status === "archived").length,
      averagePassRate: 0, // cần gọi statistics từng bài — bỏ qua cho performance
    };
  } catch {
    return { total: 0, draft: 0, published: 0, ongoing: 0, ended: 0, archived: 0, averagePassRate: 0 };
  }
}

export async function createExam(teacherId: number, dto: CreateExamDTO): Promise<TeacherExam> {
  const { data } = await apiClient.post("/exams", { ...dto, teacherId });
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
