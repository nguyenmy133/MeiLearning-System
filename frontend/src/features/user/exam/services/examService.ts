import { apiClient } from "@/lib/api-client";
import type { ExamDetail, ExamSession, ExamResult } from "../types";

/** Get all exams visible to current student */
export async function getMyExams(): Promise<ExamDetail[]> {
  const { data } = await apiClient.get("/exams");
  // Backend returns PageResponse with .content
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (Array.isArray(data)) return data;
  return [];
}

/** Get exam detail — backend allows student access */
export async function startExam(examId: string): Promise<ExamDetail> {
  const { data } = await apiClient.get(`/exams/${examId}`);
  return data;
}

/**
 * Start exam session — backend resolves studentId from JWT.
 * POST /exams/:id/start → ExamSession with questions
 */
export async function getExamSession(examId: string): Promise<ExamSession> {
  // Backend resolves student from JWT — no need to pass studentId
  const { data } = await apiClient.post(`/exams/${examId}/start`);
  return data;
}

/**
 * Submit exam — backend resolves studentId from JWT.
 * POST /exams/:id/submit → ExamResult
 */
export async function submitExam(examId: string, answers: Record<number, number>): Promise<ExamResult> {
  // Backend resolves student from JWT — no need to pass studentId
  const { data } = await apiClient.post(`/exams/${examId}/submit`, { answers });
  return data;
}

/** Get exam result — backend allows student to see own result */
export async function getExamResult(examId: string): Promise<ExamResult> {
  // Use /exams/{id}/results — backend can filter by current student
  const { data } = await apiClient.get(`/exams/${examId}/results`);
  // If returns array of results, take first (current student's)
  if (Array.isArray(data) && data.length > 0) return data[0];
  if (data && !Array.isArray(data)) return data;
  throw new Error("Chưa có kết quả");
}
