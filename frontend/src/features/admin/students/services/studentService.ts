import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";
import type {
  Student,
  CreateStudentDTO,
  UpdateStudentDTO,
  DropStudentDTO,
  StudentQueryParams,
  StudentStats,
} from "../types";

export async function getStudents(params?: StudentQueryParams): Promise<Student[]> {
  const { data } = await apiClient.get(API.STUDENTS.LIST, { params });
  // Backend returns PageResponse { data: [...], total, page, limit, totalPages }
  return Array.isArray(data) ? data : data?.data ?? [];
}

export async function getStudentById(id: number): Promise<Student> {
  const { data } = await apiClient.get(API.STUDENTS.DETAIL(id));
  return data;
}

export async function getStudentStats(): Promise<StudentStats> {
  const { data } = await apiClient.get(API.STUDENTS.STATS);
  return data;
}

export async function createStudent(dto: CreateStudentDTO): Promise<Student> {
  const { data } = await apiClient.post(API.STUDENTS.CREATE, dto);
  return data;
}

export async function updateStudent(id: number, dto: UpdateStudentDTO): Promise<Student> {
  const { data } = await apiClient.put(API.STUDENTS.UPDATE(id), dto);
  return data;
}

export async function deleteStudent(id: number): Promise<void> {
  await apiClient.delete(API.STUDENTS.DELETE(id));
}

export async function dropStudent(id: number, dto: DropStudentDTO): Promise<Student> {
  const { data } = await apiClient.patch(API.STUDENTS.DROP(id), dto);
  return data;
}

export async function reactivateStudent(id: number): Promise<Student> {
  const { data } = await apiClient.patch(API.STUDENTS.REACTIVATE(id));
  return data;
}

export async function resetStudentPassword(id: number): Promise<string> {
  const { data } = await apiClient.post(API.STUDENTS.RESET_PASSWORD(id));
  return data?.newPassword ?? data;
}

export async function checkPhoneExists(phone: string): Promise<boolean> {
  const { data } = await apiClient.get(API.STUDENTS.CHECK_PHONE, { params: { phone } });
  return (data as any)?.exists ?? false;
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const { data } = await apiClient.get(API.STUDENTS.CHECK_EMAIL, { params: { email } });
  return (data as any)?.exists ?? false;
}
