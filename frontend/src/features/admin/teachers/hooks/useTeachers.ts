import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTeachers,
  getTeacherById,
  getTeacherStats,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  resetTeacherPassword,
  lockTeacher,
  unlockTeacher,
} from "../services";
import type {
  TeacherQueryParams,
  CreateTeacherDTO,
  UpdateTeacherDTO,
} from "../types";

/**
 * ============================================================================
 * TEACHER HOOKS (React Query)
 * ============================================================================
 * Pattern: queryKey phân cấp → invalidate chính xác, tránh refetch thừa
 * ============================================================================
 */

export const teacherKeys = {
  all: ["teachers"] as const,
  lists: () => [...teacherKeys.all, "list"] as const,
  list: (params?: TeacherQueryParams) =>
    [...teacherKeys.lists(), params] as const,
  details: () => [...teacherKeys.all, "detail"] as const,
  detail: (id: number) => [...teacherKeys.details(), id] as const,
  stats: () => [...teacherKeys.all, "stats"] as const,
};

// ==================== QUERIES ====================

export const useTeachers = (params?: TeacherQueryParams) =>
  useQuery({
    queryKey: teacherKeys.list(params),
    queryFn: () => getTeachers(params),
  });

export const useTeacherDetail = (id: number) =>
  useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: () => getTeacherById(id),
    enabled: id > 0,
  });

export const useTeacherStats = () =>
  useQuery({
    queryKey: teacherKeys.stats(),
    queryFn: () => getTeacherStats(),
  });

// ==================== MUTATIONS ====================

export const useCreateTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTeacherDTO) => createTeacher(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.lists() });
      qc.invalidateQueries({ queryKey: teacherKeys.stats() });
    },
  });
};

export const useUpdateTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateTeacherDTO }) =>
      updateTeacher(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: teacherKeys.lists() });
      qc.invalidateQueries({ queryKey: teacherKeys.detail(id) });
      qc.invalidateQueries({ queryKey: teacherKeys.stats() });
    },
  });
};

export const useDeleteTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTeacher(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherKeys.lists() });
      qc.invalidateQueries({ queryKey: teacherKeys.stats() });
    },
  });
};

export const useResetTeacherPassword = () => {
  return useMutation({
    mutationFn: (id: number) => resetTeacherPassword(id),
    // Không cần invalidate queries – chỉ trả mật khẩu tạm
  });
};

export const useLockTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => lockTeacher(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: teacherKeys.lists() });
      qc.invalidateQueries({ queryKey: teacherKeys.detail(id) });
      qc.invalidateQueries({ queryKey: teacherKeys.stats() });
    },
  });
};

export const useUnlockTeacher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unlockTeacher(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: teacherKeys.lists() });
      qc.invalidateQueries({ queryKey: teacherKeys.detail(id) });
      qc.invalidateQueries({ queryKey: teacherKeys.stats() });
    },
  });
};
