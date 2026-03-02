import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateSubjectDTO, UpdateSubjectDTO, SubjectQueryParams } from "../types";
import {
  getSubjects,
  getSubjectById,
  getSubjectStats,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../services";

// ── Query key factory ─────────────────────────────────────────────────────────
export const subjectKeys = {
  all: ["subjects"] as const,
  lists: () => [...subjectKeys.all, "list"] as const,
  list: (params?: SubjectQueryParams) => [...subjectKeys.lists(), params] as const,
  details: () => [...subjectKeys.all, "detail"] as const,
  detail: (id: number) => [...subjectKeys.details(), id] as const,
  stats: () => [...subjectKeys.all, "stats"] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useSubjects(params?: SubjectQueryParams) {
  return useQuery({
    queryKey: subjectKeys.list(params),
    queryFn: () => getSubjects(params),
  });
}

export function useSubjectDetail(id: number) {
  return useQuery({
    queryKey: subjectKeys.detail(id),
    queryFn: () => getSubjectById(id),
    enabled: id > 0,
  });
}

export function useSubjectStats() {
  return useQuery({
    queryKey: subjectKeys.stats(),
    queryFn: () => getSubjectStats(),
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSubjectDTO) => createSubject(dto),
    onSuccess: (subject) => {
      qc.invalidateQueries({ queryKey: subjectKeys.all });
      toast.success(`Đã thêm môn học "${subject.name}"`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateSubjectDTO }) =>
      updateSubject(id, dto),
    onSuccess: (subject) => {
      qc.invalidateQueries({ queryKey: subjectKeys.all });
      toast.success(`Đã cập nhật môn học "${subject.name}"`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSubject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subjectKeys.all });
      toast.success("Đã xóa môn học");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
