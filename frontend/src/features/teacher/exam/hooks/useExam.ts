import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateExamDTO, ExamQueryParams } from "../types";
import {
    getTeacherExams,
    getExamById,
    getExamStats,
    createExam,
    deleteExam,
    archiveExam,
    publishExam,
    updateExam,
    getExamStatistics,
    getStudentResults,
    getQuestionAnalysis,
    getStudentExamResult,
} from "../services";

export const examKeys = {
    all: ["teacher-exams"] as const,
    lists: (params?: ExamQueryParams) => [...examKeys.all, "list", params] as const,
    detail: (id: number) => [...examKeys.all, "detail", id] as const,
    stats: () => [...examKeys.all, "stats"] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useTeacherExams(params?: ExamQueryParams) {
    return useQuery({
        queryKey: examKeys.lists(params),
        queryFn: () => getTeacherExams(params),
    });
}

export function useExamDetail(id: number) {
    return useQuery({
        queryKey: examKeys.detail(id),
        queryFn: () => getExamById(id),
        enabled: id > 0,
    });
}

export function useExamStats() {
    return useQuery({
        queryKey: examKeys.stats(),
        queryFn: () => getExamStats(),
    });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateExam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateExamDTO) => createExam(dto),
        onSuccess: (exam) => {
            qc.invalidateQueries({ queryKey: examKeys.all });
            toast.success(`Đã tạo bài thi "${exam.title}"`);
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

export function useDeleteExam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteExam(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: examKeys.all });
            toast.success("Đã xóa bài thi");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

export function useArchiveExam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => archiveExam(id),
        onSuccess: (exam) => {
            qc.invalidateQueries({ queryKey: examKeys.all });
            toast.success(`Đã lưu trữ bài thi "${exam.title}"`);
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

export function usePublishExam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => publishExam(id),
        onSuccess: (exam) => {
            qc.invalidateQueries({ queryKey: examKeys.all });
            toast.success(`Đã publish bài thi "${exam.title}"`);
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

export function useUpdateExam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateExam(id, data),
        onSuccess: (exam) => {
            qc.invalidateQueries({ queryKey: examKeys.all });
            qc.invalidateQueries({ queryKey: examKeys.detail(exam.id) });
            toast.success("Cập nhật bài thi thành công");
        },
        onError: (err: Error) => toast.error(err.message),
    });
}

// ── Exam Results Hooks ────────────────────────────────────────────────────────

export function useExamStatistics(id: number) {
    return useQuery({
        queryKey: [...examKeys.all, "statistics", id],
        queryFn: () => getExamStatistics(id),
        enabled: id > 0,
    });
}

export function useStudentResults(examId: number) {
    return useQuery({
        queryKey: [...examKeys.all, "student-results", examId],
        queryFn: () => getStudentResults(examId),
        enabled: examId > 0,
    });
}

export function useQuestionAnalysis(examId: number) {
    return useQuery({
        queryKey: [...examKeys.all, "question-analysis", examId],
        queryFn: () => getQuestionAnalysis(examId),
        enabled: examId > 0,
    });
}

export function useStudentExamResult(examId: number, studentId: string) {
    return useQuery({
        queryKey: [...examKeys.all, "student-result", examId, studentId],
        queryFn: () => getStudentExamResult(examId, studentId),
        enabled: examId > 0 && !!studentId,
    });
}
