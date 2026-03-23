// Khớp với backend DocumentResponse (ManyToMany classes)
export interface TeacherDocument {
  id: number;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;    // "pdf", "docx", "video", "image", "youtube", "other"
  fileSize: number;    // bytes (0 cho YouTube)
  classes: ClassInfo[];
  uploadedByName: string;
  uploadedById?: number;
  createdAt: string;
}

export interface ClassInfo {
  id: number;
  name: string;
}

export interface DocumentQueryParams {
  classId?: number;
  page?: number;
  limit?: number;
}

export interface UploadDocumentDTO {
  file: File;
  title: string;
  description?: string;
  classIds: number[];
}

export interface UploadYoutubeDTO {
  youtubeUrl: string;
  title: string;
  description?: string;
  classIds: number[];
}
