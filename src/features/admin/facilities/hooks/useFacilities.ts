import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFacilities,
  getFacilityById,
  getFacilityStats,
  getActiveFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
} from "../services";
import type {
  FacilityQueryParams,
  CreateFacilityDTO,
  UpdateFacilityDTO,
} from "../types";

/**
 * ============================================================================
 * FACILITY HOOKS (React Query)
 * ============================================================================
 * Pattern: queryKey phân cấp → invalidate chính xác, tránh refetch thừa
 * ============================================================================
 */

export const facilityKeys = {
  all: ["facilities"] as const,
  lists: () => [...facilityKeys.all, "list"] as const,
  list: (params?: FacilityQueryParams) => [...facilityKeys.lists(), params] as const,
  details: () => [...facilityKeys.all, "detail"] as const,
  detail: (id: number) => [...facilityKeys.details(), id] as const,
  stats: () => [...facilityKeys.all, "stats"] as const,
  activeList: () => [...facilityKeys.all, "active-list"] as const,
};

// ==================== QUERIES ====================

export const useFacilities = (params?: FacilityQueryParams) =>
  useQuery({
    queryKey: facilityKeys.list(params),
    queryFn: () => getFacilities(params),
  });

export const useFacilityDetail = (id: number) =>
  useQuery({
    queryKey: facilityKeys.detail(id),
    queryFn: () => getFacilityById(id),
    enabled: id > 0,
  });

export const useFacilityStats = () =>
  useQuery({
    queryKey: facilityKeys.stats(),
    queryFn: () => getFacilityStats(),
  });

export const useActiveFacilities = () =>
  useQuery({
    queryKey: facilityKeys.activeList(),
    queryFn: () => getActiveFacilities(),
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

// ==================== MUTATIONS ====================

export const useCreateFacility = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFacilityDTO) => createFacility(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facilityKeys.lists() });
      qc.invalidateQueries({ queryKey: facilityKeys.stats() });
      qc.invalidateQueries({ queryKey: facilityKeys.activeList() });
    },
  });
};

export const useUpdateFacility = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateFacilityDTO }) =>
      updateFacility(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: facilityKeys.lists() });
      qc.invalidateQueries({ queryKey: facilityKeys.detail(id) });
      qc.invalidateQueries({ queryKey: facilityKeys.stats() });
      qc.invalidateQueries({ queryKey: facilityKeys.activeList() });
    },
  });
};

export const useDeleteFacility = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteFacility(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facilityKeys.lists() });
      qc.invalidateQueries({ queryKey: facilityKeys.stats() });
      qc.invalidateQueries({ queryKey: facilityKeys.activeList() });
    },
  });
};
