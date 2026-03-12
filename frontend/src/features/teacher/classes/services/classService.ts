import { apiClient } from "@/lib/api-client";

export const classService = {
  async getTeacherClasses(teacherId: number) {
    const { data } = await apiClient.get("/classes", { params: { teacherId } });
    return data;
  },

  async getClassById(id: number) {
    const { data } = await apiClient.get(`/classes/${id}`);
    return data;
  },

  async getClassStudents(classId: number) {
    // Get students enrolled in a class via enrollments
    try {
      const { data } = await apiClient.get(`/classes/${classId}/students`);
      return data;
    } catch {
      // Fallback: return empty array if endpoint doesn't exist yet
      return [];
    }
  },
};

// Named function exports
export const getTeacherClasses = classService.getTeacherClasses;
export const getClassById = classService.getClassById;
