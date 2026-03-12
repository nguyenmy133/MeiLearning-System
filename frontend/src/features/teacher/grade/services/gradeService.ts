import { apiClient } from "@/lib/api-client";
import type { StudentGrade, UpdateCommentDTO, GradeQueryParams } from "../types";

export async function getClassGrades(classId: number, params?: GradeQueryParams): Promise<StudentGrade[]> {
  const { data } = await apiClient.get("/grades", { params: { classId, ...params } });
  return data;
}

export async function getGradeStats(classId: number): Promise<{ avg: number; pass: number; fail: number; total: number }> {
  const { data } = await apiClient.get("/grades/stats", { params: { classId } });
  return data;
}

export async function updateComment(classId: number, studentId: number, comment: string): Promise<void> {
  await apiClient.patch(`/grades/${classId}/students/${studentId}/comment`, { comment });
}
