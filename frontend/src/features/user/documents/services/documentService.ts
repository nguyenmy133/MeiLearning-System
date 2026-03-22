import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";
import type { DocumentItem } from "../types";

// ── Mapper: Backend DocumentResponse → Frontend DocumentItem ────────────────

/**
 * Backend DocumentResponse:
 *   { id, title, description, fileUrl, fileType (MIME), fileSize (bytes),
 *     classId, className, uploadedByName, uploadedById, createdAt }
 *
 * Frontend DocumentItem:
 *   { id, name, course, type ("pdf"|"doc"|"excel"|"ppt"|"video"|"audio"),
 *     size ("2.3 MB"), date ("2 ngày trước"), isNew, teacher, description }
 */

function detectDocType(mimeOrUrl: string): DocumentItem["type"] {
  const s = (mimeOrUrl ?? "").toLowerCase();
  if (s.includes("pdf")) return "pdf";
  if (s.includes("video") || s.endsWith(".mp4") || s.endsWith(".mov")) return "video";
  if (s.includes("word") || s.endsWith(".doc") || s.endsWith(".docx")) return "doc";
  if (s.includes("excel") || s.includes("spreadsheet") || s.endsWith(".xls") || s.endsWith(".xlsx")) return "excel";
  if (s.includes("presentation") || s.endsWith(".ppt") || s.endsWith(".pptx")) return "ppt";
  if (s.includes("audio") || s.endsWith(".mp3") || s.endsWith(".wav")) return "audio";
  return "pdf"; // default
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatRelativeDate(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return date.toLocaleDateString("vi-VN");
}

function mapDocumentResponse(raw: any): DocumentItem {
  const createdAt = raw.createdAt ?? "";
  const diffDays = createdAt
    ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  return {
    id: raw.id,
    name: raw.title ?? "Tài liệu",
    course: raw.className ?? "Chung",
    type: detectDocType(raw.fileType ?? raw.fileUrl ?? ""),
    size: formatFileSize(raw.fileSize ?? 0),
    date: formatRelativeDate(createdAt),
    isNew: diffDays <= 3,
    teacher: raw.uploadedByName ?? "",
    description: raw.description ?? undefined,
  };
}

// ── Service ─────────────────────────────────────────────────────────────────

export const documentService = {
  async getDocuments(classId?: number): Promise<DocumentItem[]> {
    const { data } = await apiClient.get(API.DOCUMENTS.LIST, {
      params: classId ? { classId } : undefined,
    });
    // Backend returns PageResponse with .data field
    const list = data?.data ?? data?.content ?? (Array.isArray(data) ? data : []);
    return list.map(mapDocumentResponse);
  },

  async getById(id: number) {
    const { data } = await apiClient.get(API.DOCUMENTS.DETAIL(id));
    return data;
  },

  async uploadDocument(file: File, metadata: { title: string; classId?: number; description?: string }) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", metadata.title);
    if (metadata.description) formData.append("description", metadata.description);
    if (metadata.classId) formData.append("classId", metadata.classId.toString());
    const { data } = await apiClient.post(API.DOCUMENTS.UPLOAD, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async deleteDocument(id: number) {
    await apiClient.delete(API.DOCUMENTS.DELETE(id));
  },

  async getCourses(): Promise<{ id: string; name: string }[]> {
    const all = [{ id: "all", name: "Tất cả" }];
    try {
      const { data } = await apiClient.get("/classes/enrolled/me");
      // getCourses also receives ApiResponse wrapper → data is the inner payload
      const list = Array.isArray(data) ? data : (data?.data ?? data?.content ?? []);
      if (list.length > 0) {
        return all.concat(list.map((c: any) => ({ id: String(c.id ?? c.name), name: c.name })));
      }
    } catch { /* fallback to just "all" */ }
    return all;
  },
};

// Named function exports
export const getDocuments = documentService.getDocuments;
export const uploadDocument = documentService.uploadDocument;
export const getCourses = documentService.getCourses;
