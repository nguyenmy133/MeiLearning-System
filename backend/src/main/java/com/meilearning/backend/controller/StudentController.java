package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.request.CreateStudentRequest;
import com.meilearning.backend.dto.request.DropStudentRequest;
import com.meilearning.backend.dto.request.UpdateStudentRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.StudentResponse;
import com.meilearning.backend.dto.response.StudentStatsResponse;
import com.meilearning.backend.service.StudentService;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@Tag(name = "Student", description = "Quản lý học viên")
@PreAuthorize("hasRole('admin')")
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    @Operation(summary = "Lấy danh sách học viên")
    public ResponseEntity<PageResponse<StudentResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String tuitionStatus,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(studentService.getAll(search, classId, status, tuitionStatus, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết học viên")
    public ResponseEntity<StudentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Tạo học viên mới (auto-create User account)")
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody CreateStudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin học viên")
    public ResponseEntity<StudentResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateStudentRequest request) {
        return ResponseEntity.ok(studentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa học viên (phải inactive)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/drop")
    @Operation(summary = "Ghi nhận nghỉ học")
    public ResponseEntity<Void> dropStudent(@PathVariable Long id,
                                             @Valid @RequestBody DropStudentRequest request) {
        studentService.dropStudent(id, request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/reactivate")
    @Operation(summary = "Kích hoạt lại học viên")
    public ResponseEntity<Void> reactivateStudent(@PathVariable Long id) {
        studentService.reactivateStudent(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reset-password")
    @Operation(summary = "Reset mật khẩu học viên")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(@PathVariable Long id) {
        String newPassword = studentService.resetPassword(id);
        return ResponseEntity.ok(java.util.Map.of("newPassword", newPassword));
    }

    @GetMapping("/stats")
    @Operation(summary = "Lấy thống kê học viên")
    public ResponseEntity<StudentStatsResponse> getStats() {
        return ResponseEntity.ok(studentService.getStats());
    }
}
