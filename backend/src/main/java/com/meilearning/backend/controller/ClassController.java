package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.request.CreateClassRequest;
import com.meilearning.backend.dto.request.UpdateClassRequest;
import com.meilearning.backend.dto.response.ClassResponse;
import com.meilearning.backend.dto.response.ClassStatsResponse;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.service.ClassService;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
@Tag(name = "Class", description = "Quản lý lớp học")
public class ClassController {

    private final ClassService classService;

    @GetMapping
    @Operation(summary = "Lấy danh sách lớp học")
    public ResponseEntity<PageResponse<ClassResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String facility,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(classService.getAll(search, subject, facility, status, teacherId, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết lớp học")
    public ResponseEntity<ClassResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(classService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Tạo lớp học mới")
    public ResponseEntity<ClassResponse> create(@Valid @RequestBody CreateClassRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(classService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật lớp học")
    public ResponseEntity<ClassResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody UpdateClassRequest request) {
        return ResponseEntity.ok(classService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa lớp học (phải không active)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/end")
    @Operation(summary = "Kết thúc lớp học")
    public ResponseEntity<Void> endClass(@PathVariable Long id) {
        classService.endClass(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "Lấy thống kê lớp học")
    public ResponseEntity<ClassStatsResponse> getStats() {
        return ResponseEntity.ok(classService.getStats());
    }
}
