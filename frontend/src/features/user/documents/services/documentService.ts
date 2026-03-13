import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

export const documentService = {
  async getDocuments(classId?: number) {
    const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.LIST, {
      params: classId ? { classId } : undefined,
    });
    return data;
  },

  async getById(id: number) {
    const { data } = await apiClient.get(API_ENDPOINTS.DOCUMENTS.DETAIL(id));
    return data;
  },

  async uploadDocument(file: File, metadata: { title: string; classId?: number; description?: string }) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", metadata.title);
    if (metadata.description) formData.append("description", metadata.description);
    if (metadata.classId) formData.append("classId", metadata.classId.toString());
    const { data } = await apiClient.post(API_ENDPOINTS.DOCUMENTS.UPLOAD, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async deleteDocument(id: number) {
    await apiClient.delete(API_ENDPOINTS.DOCUMENTS.DELETE(id));
  },
};

// Named function exports
export const getDocuments = documentService.getDocuments;
export const uploadDocument = documentService.uploadDocument;
