import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { DocumentQueryParams, UploadDocumentDTO } from "../types";
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
} from "../services/documentService";

// ── Query key factory ─────────────────────────────────────────────────────────
export const documentKeys = {
  all: ["teacher-documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (params?: DocumentQueryParams) => [...documentKeys.lists(), params] as const,
  detail: (id: number) => [...documentKeys.all, "detail", id] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

/** Lấy danh sách tài liệu — filter theo classId nếu có */
export function useDocuments(params?: DocumentQueryParams) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => getDocuments(params),
  });
}

/** Lấy chi tiết 1 tài liệu */
export function useDocumentDetail(id: number) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => getDocumentById(id),
    enabled: id > 0,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/** Upload tài liệu mới */
export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UploadDocumentDTO) => uploadDocument(dto),
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      toast.success(`Đã tải lên tài liệu "${doc.title}" thành công!`);
    },
    onError: (err: Error) => toast.error(err.message || "Tải lên thất bại"),
  });
}

/** Xóa tài liệu */
export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.lists() });
      toast.success("Đã xóa tài liệu");
    },
    onError: (err: Error) => toast.error(err.message || "Xóa thất bại"),
  });
}
