import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";
import type { Room, CreateRoomDTO, UpdateRoomDTO, RoomQueryParams } from "../types";

export async function getRooms(params?: RoomQueryParams): Promise<Room[]> {
  const { data } = await apiClient.get(API.ROOMS.LIST, { params });
  // Backend returns PageResponse { data: [...], total, page, limit, totalPages }
  return Array.isArray(data) ? data : data?.data ?? [];
}

export async function getRoomById(id: number): Promise<Room> {
  const { data } = await apiClient.get(API.ROOMS.DETAIL(id));
  return data;
}

export async function createRoom(dto: CreateRoomDTO): Promise<Room> {
  const { data } = await apiClient.post(API.ROOMS.CREATE, dto);
  return data;
}

export async function updateRoom(id: number, dto: UpdateRoomDTO): Promise<Room> {
  const { data } = await apiClient.put(API.ROOMS.UPDATE(id), dto);
  return data;
}

export async function deleteRoom(id: number): Promise<void> {
  await apiClient.delete(API.ROOMS.DELETE(id));
}
