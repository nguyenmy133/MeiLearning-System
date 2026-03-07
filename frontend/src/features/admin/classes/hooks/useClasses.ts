import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClasses,
  getClassById,
  getClassStats,
  getTeacherRefs,
  createClass,
  updateClass,
  deleteClass,
  endClass,
} from "../services";
import type { ClassQueryParams, CreateClassDTO, UpdateClassDTO } from "../types";

/**
 * ============================================================================
 * CLASS HOOKS (React Query)
 * ============================================================================
 */

export const classKeys = {
  all: ["classes"] as const,
  lists: () => [...classKeys.all, "list"] as const,
  list: (params?: ClassQueryParams) => [...classKeys.lists(), params] as const,
  details: () => [...classKeys.all, "detail"] as const,
  detail: (id: number) => [...classKeys.details(), id] as const,
  stats: () => [...classKeys.all, "stats"] as const,
  teacherRefs: () => [...classKeys.all, "teacher-refs"] as const,
};

// ==================== QUERIES ====================

export const useClasses = (params?: ClassQueryParams) =>
  useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => getClasses(params),
  });

export const useClassDetail = (id: number) =>
  useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => getClassById(id),
    enabled: id > 0,
  });

export const useClassStats = () =>
  useQuery({
    queryKey: classKeys.stats(),
    queryFn: () => getClassStats(),
  });

/** Danh sách giáo viên dùng trong dropdown — cache 5 phút */
export const useTeacherRefs = () =>
  useQuery({
    queryKey: classKeys.teacherRefs(),
    queryFn: () => getTeacherRefs(),
    staleTime: 5 * 60 * 1000,
  });

// ==================== MUTATIONS ====================

export const useCreateClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateClassDTO) => createClass(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classKeys.lists() });
      qc.invalidateQueries({ queryKey: classKeys.stats() });
    },
  });
};

export const useUpdateClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateClassDTO }) =>
      updateClass(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: classKeys.lists() });
      qc.invalidateQueries({ queryKey: classKeys.detail(id) });
      qc.invalidateQueries({ queryKey: classKeys.stats() });
    },
  });
};

export const useDeleteClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteClass(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classKeys.lists() });
      qc.invalidateQueries({ queryKey: classKeys.stats() });
    },
  });
};

export const useEndClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => endClass(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: classKeys.lists() });
      qc.invalidateQueries({ queryKey: classKeys.detail(id) });
      qc.invalidateQueries({ queryKey: classKeys.stats() });
    },
  });
};
