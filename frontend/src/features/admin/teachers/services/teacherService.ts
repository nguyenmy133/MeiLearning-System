import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";
import type {
  Teacher,
  CreateTeacherDTO,
  UpdateTeacherDTO,
  TeacherQueryParams,
  TeacherStats,
} from "../types";

export async function getTeachers(params?: TeacherQueryParams): Promise<Teacher[]> {
  const { data } = await apiClient.get(API.TEACHERS.LIST, { params });
  // Backend returns PageResponse { data: [...], total, page, limit, totalPages }
  return Array.isArray(data) ? data : data?.data ?? [];
}

export async function getTeacherById(id: number): Promise<Teacher> {
  const { data } = await apiClient.get(API.TEACHERS.DETAIL(id));
  return data;
}

export async function getTeacherStats(): Promise<TeacherStats> {
  const { data } = await apiClient.get(API.TEACHERS.STATS);
  return data;
}

export async function createTeacher(dto: CreateTeacherDTO): Promise<Teacher> {
  const { data } = await apiClient.post(API.TEACHERS.CREATE, dto);
  return data;
}

export async function updateTeacher(id: number, dto: UpdateTeacherDTO): Promise<Teacher> {
  const { data } = await apiClient.put(API.TEACHERS.UPDATE(id), dto);
  return data;
}

export async function deleteTeacher(id: number): Promise<void> {
  await apiClient.delete(API.TEACHERS.DELETE(id));
}

export async function resetTeacherPassword(id: number): Promise<string> {
  const { data } = await apiClient.post(API.TEACHERS.RESET_PASSWORD(id));
  return data?.newPassword ?? data;
}

export async function lockTeacher(id: number): Promise<void> {
  await apiClient.patch(`/teachers/${id}/lock`);
}

export async function unlockTeacher(id: number): Promise<void> {
  await apiClient.patch(`/teachers/${id}/unlock`);
}

