package com.meilearning.backend.service;

import com.meilearning.backend.dto.response.DocumentResponse;
import com.meilearning.backend.dto.response.PageResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface DocumentService {
    /**
     * Lấy danh sách tài liệu có phân quyền:
     * - Teacher: chỉ thấy tài liệu của chính mình
     * - Student: chỉ thấy tài liệu của lớp đã đăng ký
     * - Admin: thấy tất cả
     */
    PageResponse<DocumentResponse> getAll(String username, Long classId, int page, int limit);

    /** @deprecated Dùng getAll(username, classId, page, limit) thay thế */
    List<DocumentResponse> getAll(Long classId);

    DocumentResponse getById(Long id);

    /**
     * Upload file tài liệu tới 1 hoặc nhiều lớp.
     * classIds có thể rỗng/null → tài liệu không gán lớp nào.
     */
    DocumentResponse upload(String username, String title, String description,
                            List<Long> classIds, MultipartFile file);

    /**
     * Upload tài liệu YouTube — lưu URL vào fileUrl, fileType = "youtube".
     */
    DocumentResponse uploadYoutubeLink(String username, String title, String description,
                                       List<Long> classIds, String youtubeUrl);

    /**
     * Xóa tài liệu — chỉ owner hoặc admin mới được xóa.
     * Ném AccessDeniedException nếu username không phải owner.
     */
    void delete(String username, Long id);
}
