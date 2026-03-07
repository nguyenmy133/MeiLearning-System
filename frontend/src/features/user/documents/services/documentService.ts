import { mockDocuments, mockCourses } from "../data/mockData";
import type { DocumentItem, CourseFilterItem } from "../types";

export const documentService = {
    // Get all documents/videos
    getDocuments: async (): Promise<DocumentItem[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockDocuments);
            }, 500); // Giả lập network delay
        });
    },

    // Get filter courses
    getCourses: async (): Promise<CourseFilterItem[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockCourses);
            }, 200);
        });
    },
};
