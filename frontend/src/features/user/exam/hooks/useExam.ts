import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SubmitExamDTO } from "../types";
import { getMyExams, startExam, submitExam, getExamResult } from "../services";

export const examKeys = {
    all: ["user-exam"] as const,
    list: () => [...examKeys.all, "list"] as const,
    session: (id: string) => [...examKeys.all, "session", id] as const,
    result: (id: string) => [...examKeys.all, "result", id] as const,
};

export function useMyExams() {
    return useQuery({
        queryKey: examKeys.list(),
        queryFn: () => getMyExams(),
    });
}

export function useStartExam(examId: string) {
    return useQuery({
        queryKey: examKeys.session(examId),
        queryFn: () => startExam(examId),
        enabled: !!examId,
        staleTime: Infinity,  // Don't refetch during exam
    });
}

export function useExamResult(examId: string) {
    return useQuery({
        queryKey: examKeys.result(examId),
        queryFn: () => getExamResult(examId),
        enabled: !!examId,
    });
}

export function useSubmitExam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: SubmitExamDTO) => submitExam(dto),
        onSuccess: (result) => {
            qc.invalidateQueries({ queryKey: examKeys.all });
            toast.success(
                result.passed
                    ? `Nộp bài thành công! Điểm của bạn: ${result.score}/10 ✅`
                    : `Nộp bài thành công! Điểm của bạn: ${result.score}/10 ❌`
            );
        },
        onError: (err: Error) => toast.error(err.message),
    });
}
