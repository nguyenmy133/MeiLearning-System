package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.meilearning.backend.dto.response.DocumentResponse;
import com.meilearning.backend.entity.ClassEntity;
import com.meilearning.backend.entity.Document;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.repository.ClassRepository;
import com.meilearning.backend.repository.DocumentRepository;
import com.meilearning.backend.repository.UserRepository;
import com.meilearning.backend.service.DocumentService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getAll(Long classId) {
        List<Document> docs;
        if (classId != null) {
            docs = documentRepository.findByClassEntityIdOrderByCreatedAtDesc(classId);
        } else {
            docs = documentRepository.findAllByOrderByCreatedAtDesc();
        }
        return docs.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public DocumentResponse upload(String username, String title, String description,
                                   Long classId, byte[] fileData, String originalFilename,
                                   String contentType, long fileSize) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + username));

        ClassEntity classEntity = null;
        if (classId != null) {
            classEntity = classRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp: " + classId));
        }

        // Placeholder: lưu file vào local storage — production nên dùng S3
        String fileUrl = "/uploads/documents/" + user.getId() + "_" + originalFilename;

        Document document = Document.builder()
                .title(title)
                .description(description)
                .fileUrl(fileUrl)
                .fileType(contentType)
                .fileSize(fileSize)
                .classEntity(classEntity)
                .uploadedBy(user)
                .build();

        documentRepository.save(document);
        return toResponse(document);
    }

    @Override
    public void delete(Long id) {
        Document doc = findById(id);
        documentRepository.delete(doc);
    }

    private Document findById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài liệu: " + id));
    }

    private DocumentResponse toResponse(Document doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .description(doc.getDescription())
                .fileUrl(doc.getFileUrl())
                .fileType(doc.getFileType())
                .fileSize(doc.getFileSize())
                .classId(doc.getClassEntity() != null ? doc.getClassEntity().getId() : null)
                .className(doc.getClassEntity() != null ? doc.getClassEntity().getName() : null)
                .uploadedByName(doc.getUploadedBy() != null ? doc.getUploadedBy().getName() : null)
                .createdAt(doc.getCreatedAt() != null ? doc.getCreatedAt().toString() : null)
                .build();
    }
}
