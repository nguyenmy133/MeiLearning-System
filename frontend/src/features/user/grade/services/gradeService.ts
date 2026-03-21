import { apiClient } from "@/lib/api-client";
import type { ClassGrade } from "../types";

/** Get grades for current student — uses JWT-resolved /me endpoint */
export async function getMyGrades(): Promise<ClassGrade[]> {
  const { data } = await apiClient.get("/grades/me");
  if (Array.isArray(data)) return data;
  return [];
}

export async function getMyGradeByClass(classId: string): Promise<ClassGrade> {
  const grades = await getMyGrades();
  const found = grades.find((g) => g.classId === classId);
  if (found) return found;
  throw new Error("Không tìm thấy điểm");
}
