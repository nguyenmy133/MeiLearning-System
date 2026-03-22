import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SubmitExamDTO, ExamDetail, ExamSession } from "../types";
import { getMyExams, startExam, getExamData, submitExam, getExamResult, getMyAnswers } from "../services";

export const examKeys = {
    all: ["user-exam"] as const,
    list: () => [...examKeys.all, "list"] as const,
    data: (id: string) => [...examKeys.all, "data", id] as const,
    result: (id: string) => [...examKeys.all, "result", id] as const,
    answers: (id: string) => [...examKeys.all, "answers", id] as const,
};

export function useMyExams() {
    return useQuery({
        queryKey: examKeys.list(),
        queryFn: () => getMyExams(),
    });
}

/**
 * Single hook that fetches exam info + questions in ONE API call.
 * Replaces the old useStartExam() + useExamSession() pattern that made 2 identical requests.
 *
 * Returns: { examInfo: ExamDetail, session: ExamSession }
 */
export function useExamData(examId: string) {
    return useQuery({
        queryKey: examKeys.data(examId),
        queryFn: () => getExamData(examId),
        enabled: !!examId,
        staleTime: Infinity,          // Don't refetch during exam / review
        refetchOnWindowFocus: false,  // Prevent accidental refetch
    });
}

export function useExamResult(examId: string) {
    return useQuery({
        queryKey: examKeys.result(examId),
        queryFn: () => getExamResult(examId),
        enabled: !!examId,
    });
}

/** Lấy chi tiết câu trả lời (user đã chọn gì) cho trang xem lại */
export function useMyAnswers(examId: string) {
    return useQuery({
        queryKey: examKeys.answers(examId),
        queryFn: () => getMyAnswers(examId),
        enabled: !!examId,
    });
}

export function useSubmitExam() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: SubmitExamDTO) => submitExam(dto.examId, dto.answers, dto.timeSpentMinutes),
        onSuccess: (result) => {
            qc.invalidateQueries({ queryKey: examKeys.all });
            toast.success(
                result.passed
                    ? `Nộp bài thành công! Điểm: ${result.score} — Đúng: ${result.correctCount}/${result.totalQuestions} ✅`
                    : `Nộp bài thành công! Điểm: ${result.score} — Đúng: ${result.correctCount}/${result.totalQuestions} ❌`
            );
        },
        onError: (err: Error) => toast.error(err.message),
    });
}
