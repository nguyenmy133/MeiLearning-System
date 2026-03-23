import { apiClient } from "@/lib/api-client";
import type { ClassGrade } from "../types";

/** Get grades for current student — uses JWT-resolved /me endpoint */
export async function getMyGrades(): Promise<ClassGrade[]> {
  const { data } = await apiClient.get("/grades/me");
  const list = Array.isArray(data) ? data : [];
  return list.map((g: any) => ({
    classId: String(g.classId ?? g.id ?? ""),
    className: g.className ?? "",
    subject: g.subjectName ?? "",
    teacherName: g.teacherName ?? "",
    examScores: (g.examScores ?? []).map((e: any) => ({
      examId: String(e.examId ?? ""),
      examTitle: e.examTitle ?? "",
      score: Number(e.score ?? 0),
      passed: Boolean(e.passed),
      date: e.date ?? "",
      submittedAt: e.submittedAt ?? "",
      gradingStatus: e.gradingStatus ?? "no_essay",
    })).sort((a, b) => new Date(b.submittedAt || b.date).getTime() - new Date(a.submittedAt || a.date).getTime()),
    avgScore: Number(g.avgScore ?? 0),
    trend: g.trend ?? "stable",
    attendanceRate: Number(g.attendanceRate ?? 0),
    teacherComment: g.comment ?? undefined,
    commentUpdatedAt: g.updatedAt ?? undefined,
    classStatus: g.classStatus ?? "active",
  }));
}

export async function getMyGradeByClass(classId: string): Promise<ClassGrade> {
  const grades = await getMyGrades();
  const found = grades.find((g) => g.classId === classId);
  if (found) return found;
  throw new Error("Không tìm thấy điểm");
}

