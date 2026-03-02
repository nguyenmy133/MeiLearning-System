import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStudents,
  getStudentById,
  getStudentStats,
  createStudent,
  updateStudent,
  deleteStudent,
  resetStudentPassword,
  dropStudent,
  reactivateStudent,
} from "../services";
import type {
  StudentQueryParams,
  CreateStudentDTO,
  UpdateStudentDTO,
  DropStudentDTO,
} from "../types";

/**
 * ============================================================================
 * STUDENT HOOKS (React Query)
 * ============================================================================
 */

export const studentKeys = {
  all: ["students"] as const,
  lists: () => [...studentKeys.all, "list"] as const,
  list: (params?: StudentQueryParams) =>
    [...studentKeys.lists(), params] as const,
  details: () => [...studentKeys.all, "detail"] as const,
  detail: (id: number) => [...studentKeys.details(), id] as const,
  stats: () => [...studentKeys.all, "stats"] as const,
};

// ==================== QUERIES ====================

export const useStudents = (params?: StudentQueryParams) =>
  useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => getStudents(params),
  });

export const useStudentDetail = (id: number) =>
  useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => getStudentById(id),
    enabled: id > 0,
  });

export const useStudentStats = () =>
  useQuery({
    queryKey: studentKeys.stats(),
    queryFn: () => getStudentStats(),
  });

// ==================== MUTATIONS ====================

export const useCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateStudentDTO) => createStudent(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studentKeys.lists() });
      qc.invalidateQueries({ queryKey: studentKeys.stats() });
    },
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateStudentDTO }) =>
      updateStudent(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: studentKeys.lists() });
      qc.invalidateQueries({ queryKey: studentKeys.detail(id) });
      qc.invalidateQueries({ queryKey: studentKeys.stats() });
    },
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteStudent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studentKeys.lists() });
      qc.invalidateQueries({ queryKey: studentKeys.stats() });
    },
  });
};

export const useResetStudentPassword = () =>
  useMutation({
    mutationFn: (id: number) => resetStudentPassword(id),
    // Không cần invalidate – chỉ trả mật khẩu tạm
  });

export const useDropStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: DropStudentDTO }) =>
      dropStudent(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: studentKeys.lists() });
      qc.invalidateQueries({ queryKey: studentKeys.detail(id) });
      qc.invalidateQueries({ queryKey: studentKeys.stats() });
    },
  });
};

export const useReactivateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reactivateStudent(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: studentKeys.lists() });
      qc.invalidateQueries({ queryKey: studentKeys.detail(id) });
      qc.invalidateQueries({ queryKey: studentKeys.stats() });
    },
  });
};
