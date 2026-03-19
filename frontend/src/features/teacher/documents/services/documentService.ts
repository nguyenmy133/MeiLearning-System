import { apiClient } from "@/lib/api-client";
import type { TeacherDocument, DocumentQueryParams, UploadDocumentDTO } from "../types";

/**
 * Document Service — tích hợp hoàn toàn với backend API.
 *
 * Endpoints:
 *   GET    /api/v1/documents?classId=&page=&limit=
 *   GET    /api/v1/documents/{id}
 *   POST   /api/v1/documents (multipart/form-data)
 *   DELETE /api/v1/documents/{id}
 */

const BASE = "/documents";

function mapDoc(raw: any): TeacherDocument {
  return {
    id: raw.id,
    title: raw.title ?? "",
    description: raw.description,
    fileUrl: raw.fileUrl ?? "",
    fileType: detectFileType(raw.fileType ?? raw.fileUrl ?? ""),
    fileSize: raw.fileSize ?? 0,
    classId: raw.classId ?? undefined,
    className: raw.className,
    uploadedByName: raw.uploadedByName ?? "",
    uploadedById: raw.uploadedById ?? undefined,
    createdAt: raw.createdAt ?? "",
  };
}

/** Suy ra loại file từ MIME type hoặc đuôi URL */
function detectFileType(mimeOrUrl: string): string {
  const s = mimeOrUrl.toLowerCase();
  if (s.includes("pdf")) return "pdf";
  if (s.includes("video") || s.endsWith(".mp4") || s.endsWith(".mov")) return "video";
  if (s.includes("image") || s.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "image";
  if (s.includes("word") || s.match(/\.(doc|docx)$/)) return "doc";
  if (s.match(/\.(ppt|pptx)$/)) return "ppt";
  return "file";
}

/** Lấy danh sách tài liệu (filter theo classId nếu có) */
export async function getDocuments(
  params?: DocumentQueryParams
): Promise<TeacherDocument[]> {
  const { data } = await apiClient.get(BASE, { params });
  // Backend trả PageResponse { data: [...], ... } hoặc array thẳng
  const list = Array.isArray(data) ? data : (data?.data ?? []);
  return list.map(mapDoc);
}

/** Lấy chi tiết 1 tài liệu */
export async function getDocumentById(id: number): Promise<TeacherDocument> {
  const { data } = await apiClient.get(`${BASE}/${id}`);
  return mapDoc(data);
}

/**
 * Upload tài liệu mới — dùng multipart/form-data.
 * Backend: POST /documents?title=...&description=...&classId=...&file=<binary>
 */
export async function uploadDocument(dto: UploadDocumentDTO): Promise<TeacherDocument> {
  const formData = new FormData();
  formData.append("file", dto.file);
  formData.append("title", dto.title);
  if (dto.description) formData.append("description", dto.description);
  if (dto.classId != null) formData.append("classId", String(dto.classId));

  const { data } = await apiClient.post(BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapDoc(data);
}

/** Xóa tài liệu */
export async function deleteDocument(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

/** Định dạng byte → human-readable size */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
