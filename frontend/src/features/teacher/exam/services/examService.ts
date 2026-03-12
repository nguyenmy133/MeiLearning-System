import { apiClient } from "@/lib/api-client";
import type { TeacherExam, CreateExamDTO, UpdateExamDTO, ExamQueryParams } from "../types";

export async function getTeacherExams(teacherId: number, params?: ExamQueryParams): Promise<TeacherExam[]> {
  const { data } = await apiClient.get("/exams", { params: { teacherId, ...params } });
  return data;
}

export async function getExamById(id: number, teacherId?: number): Promise<TeacherExam> {
  const { data } = await apiClient.get(`/exams/${id}`);
  return data;
}

export async function getExamStats(teacherId: number): Promise<{ total: number; draft: number; ongoing: number; ended: number }> {
  const { data } = await apiClient.get("/exams/stats", { params: { teacherId } });
  return data;
}

export async function createExam(teacherId: number, dto: CreateExamDTO): Promise<TeacherExam> {
  const { data } = await apiClient.post("/exams", { ...dto, teacherId });
  return data;
}

export async function updateExam(id: number, teacherId: number, dto: UpdateExamDTO): Promise<TeacherExam> {
  const { data } = await apiClient.put(`/exams/${id}`, { ...dto, teacherId });
  return data;
}

export async function deleteExam(id: number, teacherId?: number): Promise<void> {
  await apiClient.delete(`/exams/${id}`);
}

export async function archiveExam(id: number, teacherId?: number): Promise<TeacherExam> {
  const { data } = await apiClient.patch(`/exams/${id}/archive`);
  return data;
}

// ── Exam Results ──────────────────────────────────────────────────────────────

export async function getExamInfo(examId: number) {
  const { data } = await apiClient.get(`/exams/${examId}/info`);
  return data;
}

export async function getExamStatistics(examId: number) {
  const { data } = await apiClient.get(`/exams/${examId}/statistics`);
  return data;
}

export async function getStudentResults(examId: number) {
  const { data } = await apiClient.get(`/exams/${examId}/results`);
  return data;
}

export async function getQuestionAnalysis(examId: number) {
  const { data } = await apiClient.get(`/exams/${examId}/question-analysis`);
  return data;
}

export async function getStudentExamResult(examId: number, studentId: string) {
  const { data } = await apiClient.get(`/exams/${examId}/results/${studentId}`);
  return data;
}
