package meilearning.com.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import meilearning.com.backend.dto.request.CreateSubjectRequest;
import meilearning.com.backend.dto.request.UpdateSubjectRequest;
import meilearning.com.backend.dto.response.PageResponse;
import meilearning.com.backend.dto.response.SubjectResponse;
import meilearning.com.backend.dto.response.SubjectStatsResponse;
import meilearning.com.backend.service.SubjectService;

@RestController
@RequestMapping("/api/v1/subjects")
@RequiredArgsConstructor
@Tag(name = "Subject", description = "Quản lý môn học")
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    @Operation(summary = "Lấy danh sách môn học (phân trang + filter)")
    public ResponseEntity<PageResponse<SubjectResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(subjectService.getAll(search, category, status, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết môn học theo ID")
    public ResponseEntity<SubjectResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(subjectService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Tạo môn học mới")
    public ResponseEntity<SubjectResponse> create(@Valid @RequestBody CreateSubjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subjectService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật môn học")
    public ResponseEntity<SubjectResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSubjectRequest request) {
        return ResponseEntity.ok(subjectService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa môn học")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subjectService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "Lấy thống kê môn học")
    public ResponseEntity<SubjectStatsResponse> getStats() {
        return ResponseEntity.ok(subjectService.getStats());
    }
}
