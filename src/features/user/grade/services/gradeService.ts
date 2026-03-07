import type { ClassGrade } from "../types";

const randomDelay = () => new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

import { MOCK_GRADES } from "../data/mockData";

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Get grade overview across all classes (active + completed).
 * Phase 2: GET /api/user/grades
 */
export async function getMyGrades(): Promise<ClassGrade[]> {
    await randomDelay();
    return clone(MOCK_GRADES);
}

/**
 * Get grade detail for a specific class.
 * Phase 2: GET /api/user/grades/{classId}
 * Works for both ACTIVE and COMPLETED classes.
 */
export async function getMyGradeByClass(classId: string): Promise<ClassGrade> {
    await randomDelay();
    const grade = MOCK_GRADES.find((g) => g.classId === classId);
    if (!grade) throw new Error("Không tìm thấy kết quả học tập cho lớp này.");
    return clone(grade);
}
