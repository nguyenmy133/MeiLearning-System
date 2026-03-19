package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.meilearning.backend.dto.response.DocumentResponse;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.service.DocumentService;
import java.security.Principal;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Document", description = "Quản lý tài liệu")
@PreAuthorize("hasAnyRole('admin', 'teacher', 'student')")
public class DocumentController {

    private final DocumentService documentService;

    /**
     * Lấy danh sách tài liệu.
     *
     * Logic hiển thị (RBAC):
     * - TEACHER: chỉ thấy tài liệu của chính mình (uploadedBy = current user)
     *   + filter thêm classId nếu có
     * - ADMIN: thấy tất cả (không filter theo uploadedBy)
     * - STUDENT: thấy tài liệu của lớp mình (filter classId) — gọi qua endpoint khác
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách tài liệu")
    public ResponseEntity<PageResponse<DocumentResponse>> getAll(
            Principal principal,
            @RequestParam(required = false) Long classId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(documentService.getAll(principal.getName(), classId, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết tài liệu")
    public ResponseEntity<DocumentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Upload tài liệu mới")
    @PreAuthorize("hasAnyRole('admin', 'teacher')")
    public ResponseEntity<DocumentResponse> upload(Principal principal,
                                                   @RequestParam("file") MultipartFile file,
                                                   @RequestParam("title") String title,
                                                   @RequestParam(value = "description", required = false) String description,
                                                   @RequestParam(value = "classId", required = false) Long classId) {
        DocumentResponse response = documentService.upload(
                principal.getName(), title, description, classId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa tài liệu (chỉ owner hoặc admin)")
    @PreAuthorize("hasAnyRole('admin', 'teacher')")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable Long id) {
        documentService.delete(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
