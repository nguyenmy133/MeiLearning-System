package com.meilearning.backend.service;

import com.meilearning.backend.dto.response.DocumentResponse;
import com.meilearning.backend.dto.response.PageResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface DocumentService {
    /**
     * Lấy danh sách tài liệu có phân quyền:
     * - Teacher: chỉ thấy tài liệu của chính mình
     * - Admin: thấy tất cả
     */
    PageResponse<DocumentResponse> getAll(String username, Long classId, int page, int limit);

    /** @deprecated Dùng getAll(username, classId, page, limit) thay thế */
    List<DocumentResponse> getAll(Long classId);

    DocumentResponse getById(Long id);

    DocumentResponse upload(String username, String title, String description,
                            Long classId, MultipartFile file);

    /**
     * Xóa tài liệu — chỉ owner hoặc admin mới được xóa.
     * Ném AccessDeniedException nếu username không phải owner.
     */
    void delete(String username, Long id);
}
