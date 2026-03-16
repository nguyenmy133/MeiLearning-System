package com.meilearning.backend.service;

import com.meilearning.backend.dto.response.DocumentResponse;
import com.meilearning.backend.dto.response.PageResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface DocumentService {
    PageResponse<DocumentResponse> getAll(Long classId, int page, int limit);
    List<DocumentResponse> getAll(Long classId);
    DocumentResponse getById(Long id);
    DocumentResponse upload(String username, String title, String description,
                            Long classId, MultipartFile file);
    void delete(Long id);
}
