import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";
import type {
  Subject,
  CreateSubjectDTO,
  UpdateSubjectDTO,
  SubjectQueryParams,
  SubjectStats,
} from "../types";

// ── Service ───────────────────────────────────────────────────────────────────

/** Fetch subject list with optional filters */
export async function getSubjects(params?: SubjectQueryParams): Promise<Subject[]> {
  const { data } = await apiClient.get(API.SUBJECTS.LIST, { params });
  return data;
}

/** Fetch a single subject by id */
export async function getSubjectById(id: number): Promise<Subject> {
  const { data } = await apiClient.get(API.SUBJECTS.DETAIL(id));
  return data;
}

/** Compute aggregate stats */
export async function getSubjectStats(): Promise<SubjectStats> {
  const { data } = await apiClient.get(`${API.SUBJECTS.LIST}/stats`);
  return data;
}

/** Create a new subject */
export async function createSubject(dto: CreateSubjectDTO): Promise<Subject> {
  const { data } = await apiClient.post(API.SUBJECTS.CREATE, dto);
  return data;
}

/** Update an existing subject */
export async function updateSubject(id: number, dto: UpdateSubjectDTO): Promise<Subject> {
  const { data } = await apiClient.put(API.SUBJECTS.UPDATE(id), dto);
  return data;
}

/** Delete a subject */
export async function deleteSubject(id: number): Promise<void> {
  await apiClient.delete(API.SUBJECTS.DELETE(id));
}
