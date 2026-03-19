// Khớp với backend DocumentResponse
export interface TeacherDocument {
  id: number;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;    // "pdf", "docx", "video", "image", "other"
  fileSize: number;    // bytes
  classId?: number;
  className?: string;
  uploadedByName: string;
  uploadedById?: number;   // ID của người upload — dùng để kiểm tra ownership
  createdAt: string;
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
  classId?: number;
}
