import { useQuery } from "@tanstack/react-query";
import { getMyGrades, getMyGradeByClass } from "../services";

export const gradeKeys = {
    all: ["user-grade"] as const,
    list: () => [...gradeKeys.all, "list"] as const,
    detail: (classId: string) => [...gradeKeys.all, "detail", classId] as const,
};

export function useMyGrades() {
    return useQuery({
        queryKey: gradeKeys.list(),
        queryFn: () => getMyGrades(),
    });
}

export function useMyGradeByClass(classId: string) {
    return useQuery({
        queryKey: gradeKeys.detail(classId),
        queryFn: () => getMyGradeByClass(classId),
        enabled: !!classId,
    });
}
