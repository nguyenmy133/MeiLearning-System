import { apiClient } from "@/lib/api-client";
import type { ExamDetail, ExamResult } from "../types";
import { MOCK_EXAMS, MOCK_RESULTS } from "../data/mockData";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export async function getMyExams(): Promise<ExamDetail[]> {
  try {
    const { data } = await apiClient.get("/exams");
    if (Array.isArray(data) && data.length > 0) return data;
  } catch { /* fallback */ }
  return clone(MOCK_EXAMS);
}

export async function startExam(examId: string): Promise<ExamDetail> {
  const exam = MOCK_EXAMS.find((e) => e.id === examId);
  if (!exam) throw new Error("Không tìm thấy bài kiểm tra");
  return clone(exam);
}

export async function submitExam(examId: string, answers: Record<number, number>): Promise<ExamResult> {
  try {
    const { data } = await apiClient.post(`/exams/${examId}/submit`, {
      studentId: 0, // TODO: use actual studentId
      score: 80,
      correctAnswers: Object.keys(answers).length,
    });
    return data;
  } catch { /* fallback */ }
  return MOCK_RESULTS[examId] ?? {
    examId, examTitle: "", classId: "", className: "",
    score: 0, maxScore: 10, passed: false,
    correctCount: 0, totalQuestions: 0, submittedAt: new Date().toISOString(),
    breakdown: [],
  };
}

export async function getExamResult(examId: string): Promise<ExamResult> {
  try {
    const { data } = await apiClient.get(`/exams/${examId}/results/0`); // TODO: use actual studentId
    return data;
  } catch { /* fallback */ }
  const result = MOCK_RESULTS[examId];
  if (!result) throw new Error("Chưa có kết quả");
  return clone(result);
}
