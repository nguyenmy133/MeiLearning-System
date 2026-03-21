import { apiClient } from "@/lib/api-client";
import { API } from "@/config/api-endpoints";

export const documentService = {
  async getDocuments(classId?: number) {
    const { data } = await apiClient.get(API.DOCUMENTS.LIST, {
      params: classId ? { classId } : undefined,
    });
    // Backend returns PageResponse with .content array — unwrap it
    if (Array.isArray(data)) return data;
    if (data?.content && Array.isArray(data.content)) return data.content;
    return [];
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
      const list = Array.isArray(data) ? data : data?.content ?? [];
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
