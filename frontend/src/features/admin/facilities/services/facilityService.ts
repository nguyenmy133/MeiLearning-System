import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";
import type {
  Facility,
  CreateFacilityDTO,
  UpdateFacilityDTO,
  FacilityStats,
  FacilityQueryParams,
} from "../types";

export async function getFacilities(params?: FacilityQueryParams): Promise<Facility[]> {
  const { data } = await apiClient.get(API.FACILITIES.LIST, { params });
  // Backend returns PageResponse { data: [...], total, page, limit, totalPages }
  return Array.isArray(data) ? data : data?.data ?? [];
}

export async function getFacilityById(id: number): Promise<Facility> {
  const { data } = await apiClient.get(API.FACILITIES.DETAIL(id));
  return data;
}

export async function getFacilityStats(): Promise<FacilityStats> {
  const { data } = await apiClient.get(API.FACILITIES.STATS);
  return data;
}

export async function createFacility(dto: CreateFacilityDTO): Promise<Facility> {
  const { data } = await apiClient.post(API.FACILITIES.CREATE, dto);
  return data;
}

export async function updateFacility(id: number, dto: UpdateFacilityDTO): Promise<Facility> {
  const { data } = await apiClient.put(API.FACILITIES.UPDATE(id), dto);
  return data;
}

export async function deleteFacility(id: number): Promise<void> {
  await apiClient.delete(API.FACILITIES.DELETE(id));
}

export async function getActiveFacilities(): Promise<Facility[]> {
  const { data } = await apiClient.get(API.FACILITIES.LIST, { params: { status: "active" } });
  return Array.isArray(data) ? data : data?.data ?? [];
}

