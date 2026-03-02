import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../services";
import type { RoomQueryParams, CreateRoomDTO, UpdateRoomDTO } from "../types";
import { facilityKeys } from "./useFacilities";

/**
 * ============================================================================
 * ROOM HOOKS (React Query)
 * ============================================================================
 */

export const roomKeys = {
  all: ["rooms"] as const,
  lists: () => [...roomKeys.all, "list"] as const,
  list: (params?: RoomQueryParams) => [...roomKeys.lists(), params] as const,
  details: () => [...roomKeys.all, "detail"] as const,
  detail: (id: number) => [...roomKeys.details(), id] as const,
};

// ==================== QUERIES ====================

export const useRooms = (params?: RoomQueryParams) =>
  useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => getRooms(params),
  });

export const useRoomDetail = (id: number) =>
  useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => getRoomById(id),
    enabled: id > 0,
  });

// ==================== MUTATIONS ====================

export const useCreateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRoomDTO) => createRoom(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomKeys.lists() });
      qc.invalidateQueries({ queryKey: facilityKeys.stats() });
    },
  });
};

export const useUpdateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateRoomDTO }) =>
      updateRoom(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: roomKeys.lists() });
      qc.invalidateQueries({ queryKey: roomKeys.detail(id) });
      qc.invalidateQueries({ queryKey: facilityKeys.stats() });
    },
  });
};

export const useDeleteRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRoom(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomKeys.lists() });
      qc.invalidateQueries({ queryKey: facilityKeys.stats() });
    },
  });
};
