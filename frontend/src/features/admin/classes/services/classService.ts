import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";
import type {
  Class,
  CreateClassDTO,
  UpdateClassDTO,
  ClassQueryParams,
  ClassStats,
} from "../types";

export async function getClasses(params?: ClassQueryParams): Promise<Class[]> {
  const { data } = await apiClient.get(API.CLASSES.LIST, { params });
  return data;
}

export async function getClassById(id: number): Promise<Class> {
  const { data } = await apiClient.get(API.CLASSES.DETAIL(id));
  return data;
}

export async function getClassStats(): Promise<ClassStats> {
  const { data } = await apiClient.get(API.CLASSES.STATS);
  return data;
}

export async function createClass(dto: CreateClassDTO): Promise<Class> {
  const { data } = await apiClient.post(API.CLASSES.CREATE, dto);
  return data;
}

export async function updateClass(id: number, dto: UpdateClassDTO): Promise<Class> {
  const { data } = await apiClient.put(API.CLASSES.UPDATE(id), dto);
  return data;
}

export async function deleteClass(id: number): Promise<void> {
  await apiClient.delete(API.CLASSES.DELETE(id));
}

export async function getTeacherRefs(): Promise<Array<{ id: number; name: string }>> {
  const { data } = await apiClient.get("/teachers", { params: { limit: 100 } });
  return data;
}

export async function endClass(id: number): Promise<Class> {
  const { data } = await apiClient.patch(API.CLASSES.END(id));
  return data;
}
