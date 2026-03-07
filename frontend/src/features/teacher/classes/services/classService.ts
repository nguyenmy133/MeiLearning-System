import type { StudentInfo } from "../types";
import { MOCK_STUDENTS } from "../data/mockData";

export const classService = {
    // Get students of a class
    getClassStudents: async (classId: number): Promise<StudentInfo[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_STUDENTS); // In real app, fetch based on classId
            }, 500);
        });
    },
};
