import { apiClient } from "@/lib/api-client";
import type { ClassGrade } from "../types";
import { MOCK_GRADES } from "../data/mockData";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export async function getMyGrades(): Promise<ClassGrade[]> {
  try {
    const { data } = await apiClient.get("/grades/student/0"); // TODO: use actual studentId
    if (Array.isArray(data) && data.length > 0) return data;
  } catch { /* fallback */ }
  return clone(MOCK_GRADES);
}

export async function getMyGradeByClass(classId: string): Promise<ClassGrade> {
  try {
    const grades = await getMyGrades();
    const found = grades.find((g) => g.classId === classId);
    if (found) return found;
  } catch { /* fallback */ }
  const grade = MOCK_GRADES.find((g) => g.classId === classId);
  if (!grade) throw new Error("Không tìm thấy điểm");
  return clone(grade);
}
