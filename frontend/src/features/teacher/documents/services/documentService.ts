import { apiClient } from "@/lib/api-client";
import type { TeacherDocument, DocumentQueryParams, UploadDocumentDTO, UploadYoutubeDTO } from "../types";

/**
 * Document Service — tích hợp hoàn toàn với backend API.
 *
 * Endpoints:
 *   GET    /api/v1/documents?classId=&page=&limit=
 *   GET    /api/v1/documents/{id}
 *   POST   /api/v1/documents (multipart/form-data — file upload)
 *   POST   /api/v1/documents/youtube (YouTube URL)
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
    classes: (raw.classes ?? []).map((c: any) => ({ id: c.id, name: c.name })),
    uploadedByName: raw.uploadedByName ?? "",
    uploadedById: raw.uploadedById ?? undefined,
    createdAt: raw.createdAt ?? "",
  };
}

/** Suy ra loại file từ MIME type, đuôi URL hoặc "youtube" */
function detectFileType(mimeOrUrl: string): string {
  const s = mimeOrUrl.toLowerCase();
  if (s === "youtube" || s.includes("youtube.com") || s.includes("youtu.be")) return "youtube";
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
 * Upload tài liệu file — multipart/form-data.
 * classIds gửi dưới dạng nhiều field cùng tên.
 */
export async function uploadDocument(dto: UploadDocumentDTO): Promise<TeacherDocument> {
  const formData = new FormData();
  formData.append("file", dto.file);
  formData.append("title", dto.title);
  if (dto.description) formData.append("description", dto.description);
  if (dto.classIds?.length) {
    dto.classIds.forEach((id) => formData.append("classIds", String(id)));
  }

  const { data } = await apiClient.post(BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapDoc(data);
}

/**
 * Upload tài liệu YouTube — gửi URL, không cần file.
 */
export async function uploadYoutubeDocument(dto: UploadYoutubeDTO): Promise<TeacherDocument> {
  const params = new URLSearchParams();
  params.append("youtubeUrl", dto.youtubeUrl);
  params.append("title", dto.title);
  if (dto.description) params.append("description", dto.description);
  if (dto.classIds?.length) {
    dto.classIds.forEach((id) => params.append("classIds", String(id)));
  }

  const { data } = await apiClient.post(`${BASE}/youtube`, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

/** Extract YouTube video ID from URL */
export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** Get YouTube thumbnail URL */
export function getYoutubeThumbnail(url: string): string | null {
  const videoId = extractYoutubeId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}
