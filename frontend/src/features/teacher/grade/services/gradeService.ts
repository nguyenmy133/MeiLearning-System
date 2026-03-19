import { apiClient } from "@/lib/api-client";
import type { StudentGrade, UpdateCommentDTO, GradeQueryParams } from "../types";

/**
 * Grade Service — tích hợp với backend.
 *
 * Endpoints backend:
 *   GET    /api/v1/grades?classId=&...
 *   GET    /api/v1/grades/stats?classId=
 *   PATCH  /api/v1/grades/{classId}/students/{studentId}/comment
 */

export async function getClassGrades(
  classId: number,
  params?: GradeQueryParams
): Promise<StudentGrade[]> {
  const { data } = await apiClient.get("/grades", {
    params: { classId, ...params },
  });
  // Handle cả array và PageResponse
  if (Array.isArray(data)) return data;
  return data?.data ?? [];
}

export async function getGradeStats(
  classId: number
): Promise<{ avg: number; pass: number; fail: number; total: number }> {
  try {
    const { data } = await apiClient.get("/grades/stats", {
      params: { classId },
    });
    return {
      avg: data?.avgScore ?? data?.avg ?? 0,
      pass: data?.passed ?? data?.pass ?? 0,
      fail: data?.failed ?? data?.fail ?? 0,
      total: data?.totalStudents ?? data?.total ?? 0,
    };
  } catch {
    return { avg: 0, pass: 0, fail: 0, total: 0 };
  }
}

/**
 * Cập nhật nhận xét — PATCH /grades/{classId}/students/{studentId}/comment
 * Signature: (classId, studentId, comment) — khớp với gradeService.ts
 */
export async function updateComment(
  classId: number,
  studentId: number,
  comment: string
): Promise<void> {
  await apiClient.patch(`/grades/${classId}/students/${studentId}/comment`, {
    comment,
  });
}
