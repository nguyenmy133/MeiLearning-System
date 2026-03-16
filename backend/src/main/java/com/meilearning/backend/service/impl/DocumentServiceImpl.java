package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.meilearning.backend.dto.response.DocumentResponse;
import com.meilearning.backend.entity.ClassEntity;
import com.meilearning.backend.entity.Document;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.repository.ClassRepository;
import com.meilearning.backend.repository.DocumentRepository;
import com.meilearning.backend.repository.UserRepository;
import com.meilearning.backend.service.DocumentService;
import com.meilearning.backend.service.FileStorageService;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.util.SpecHelper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DocumentResponse> getAll(Long classId, int page, int limit) {
        if (page < 1) page = 1;
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Specification<Document> spec = SpecHelper.empty();
        if (classId != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("classEntity").get("id"), classId));
        }
        Page<Document> result = documentRepository.findAll(spec, pageable);
        return PageResponse.<DocumentResponse>builder()
                .data(result.getContent().stream().map(this::toResponse).toList())
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(result.getTotalPages())
                .build();
    }

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
                                   Long classId, MultipartFile file) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + username));

        ClassEntity classEntity = null;
        if (classId != null) {
            classEntity = classRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp: " + classId));
        }

        // Lưu file thực tế qua FileStorageService
        String fileUrl = fileStorageService.store(file, "documents");

        Document document = Document.builder()
                .title(title)
                .description(description)
                .fileUrl(fileUrl)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .classEntity(classEntity)
                .uploadedBy(user)
                .build();

        documentRepository.save(document);
        return toResponse(document);
    }

    @Override
    public void delete(Long id) {
        Document doc = findById(id);
        // Xóa file vật lý trước khi xóa record
        fileStorageService.delete(doc.getFileUrl());
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
