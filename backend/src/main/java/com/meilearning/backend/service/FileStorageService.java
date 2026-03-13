package com.meilearning.backend.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Service xử lý upload file — avatars, documents, etc.
 */
public interface FileStorageService {

    /**
     * Lưu file và trả về URL truy cập.
     *
     * @param file     file upload
     * @param subDir   thư mục con (e.g. "avatars", "documents")
     * @return đường dẫn file đã lưu (relative URL)
     */
    String store(MultipartFile file, String subDir);

    /**
     * Xóa file đã lưu.
     *
     * @param filePath đường dẫn file cần xóa
     */
    void delete(String filePath);
}
