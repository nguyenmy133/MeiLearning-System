import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/features/shared/auth/authService";
import type { GradeQueryParams, UpdateCommentDTO } from "../types";
import { getClassGrades, getGradeStats, updateComment } from "../services";

const teacherId = () => authService.getCurrentTeacherIdSafe();

export const gradeKeys = {
    all: ["teacher-grades"] as const,
    list: (classId: number, params?: GradeQueryParams) =>
        [...gradeKeys.all, "list", classId, params] as const,
    stats: (classId: number) => [...gradeKeys.all, "stats", classId] as const,
};

export function useClassGrades(classId: number, params?: GradeQueryParams) {
    return useQuery({
        queryKey: gradeKeys.list(classId, params),
        queryFn: () => getClassGrades(classId, params),
        enabled: classId > 0,
    });
}

export function useGradeStats(classId: number) {
    return useQuery({
        queryKey: gradeKeys.stats(classId),
        queryFn: () => getGradeStats(classId),
        enabled: classId > 0,
    });
}

export function useUpdateComment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: UpdateCommentDTO) =>
            updateComment(dto.classId, Number(dto.studentId), dto.comment),
        onSuccess: (_data, dto) => {
            qc.invalidateQueries({ queryKey: gradeKeys.list(dto.classId) });
            toast.success("Đã cập nhật nhận xét thành công");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

