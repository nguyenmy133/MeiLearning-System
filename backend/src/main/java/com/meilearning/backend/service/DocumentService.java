package com.meilearning.backend.service;

import com.meilearning.backend.dto.response.DocumentResponse;

import java.util.List;

public interface DocumentService {
    List<DocumentResponse> getAll(Long classId);
    DocumentResponse getById(Long id);
    DocumentResponse upload(String username, String title, String description, Long classId,
                            byte[] fileData, String originalFilename, String contentType, long fileSize);
    void delete(Long id);
}
