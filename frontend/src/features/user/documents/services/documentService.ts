import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";
import type { DocumentItem } from "../types";

// ── YouTube helpers ─────────────────────────────────────────────────────────

function extractYoutubeId(url: string): string | null {
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

// ── Mapper: Backend DocumentResponse → Frontend DocumentItem ────────────────

function detectDocType(mimeOrUrl: string): DocumentItem["type"] {
  const s = (mimeOrUrl ?? "").toLowerCase();
  if (s === "youtube") return "youtube";
  if (s.includes("youtube.com") || s.includes("youtu.be")) return "youtube";
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

  const fileType = raw.fileType ?? "";
  const fileUrl = raw.fileUrl ?? "";
  const docType = detectDocType(fileType || fileUrl);

  // Map class names — backend trả mảng classes: [{id, name}]
  const classNames = (raw.classes ?? [])
    .map((c: any) => c.name)
    .filter(Boolean)
    .join(", ");

  return {
    id: raw.id,
    name: raw.title ?? "Tài liệu",
    course: classNames || "Chung",
    type: docType,
    size: formatFileSize(raw.fileSize ?? 0),
    date: formatRelativeDate(createdAt),
    isNew: diffDays <= 3,
    teacher: raw.uploadedByName ?? "",
    fileUrl: fileUrl,
    youtubeId: docType === "youtube" ? extractYoutubeId(fileUrl) ?? undefined : undefined,
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

  async getCourses(): Promise<{ id: string; name: string }[]> {
    const all = [{ id: "all", name: "Tất cả" }];
    try {
      const { data } = await apiClient.get("/classes/enrolled/me");
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
export const getCourses = documentService.getCourses;
