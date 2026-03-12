export const documentService = {
  async getDocuments() {
    // TODO: Document management endpoint not yet on backend
    return [];
  },

  async getCourses() {
    // TODO: Document courses endpoint not yet on backend
    return [];
  },

  async uploadDocument(file: File, metadata: { title: string; classId?: number }) {
    // TODO: Implement when BE is ready
    return null;
  },
};

// Named function exports
export const getDocuments = documentService.getDocuments;
export const uploadDocument = documentService.uploadDocument;
