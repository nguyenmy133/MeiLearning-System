import { useQuery } from "@tanstack/react-query";
import { classService } from "../services/classService";

export const useClassStudents = (classId: number | null) => {
    return useQuery({
        queryKey: ["teacher", "classes", "students", classId],
        queryFn: () => classService.getClassStudents(classId as number),
        enabled: classId !== null, // Only fetch when there is a selected class
    });
};
