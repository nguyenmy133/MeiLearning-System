import { apiClient } from "@/lib/api-client";
import { authService } from "@/features/shared/auth/authService";
import type { ClassGrade } from "../types";
import { MOCK_GRADES } from "../data/mockData";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

function getCurrentStudentId(): number {
  const user = authService.getCurrentUser();
  if (!user) throw new Error("Chưa đăng nhập");
  return user.id;
}

export async function getMyGrades(): Promise<ClassGrade[]> {
  try {
    const studentId = getCurrentStudentId();
    const { data } = await apiClient.get(`/grades/student/${studentId}`);
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
