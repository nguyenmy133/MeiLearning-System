package meilearning.com.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import meilearning.com.backend.dto.request.CreateTeacherRequest;
import meilearning.com.backend.dto.request.UpdateTeacherRequest;
import meilearning.com.backend.dto.response.PageResponse;
import meilearning.com.backend.dto.response.TeacherResponse;
import meilearning.com.backend.dto.response.TeacherStatsResponse;
import meilearning.com.backend.service.TeacherService;

@RestController
@RequestMapping("/api/v1/teachers")
@RequiredArgsConstructor
@Tag(name = "Teacher", description = "Quản lý giáo viên")
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    @Operation(summary = "Lấy danh sách giáo viên")
    public ResponseEntity<PageResponse<TeacherResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(teacherService.getAll(search, subject, status, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết giáo viên")
    public ResponseEntity<TeacherResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(teacherService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Tạo giáo viên mới (auto-create User account)")
    public ResponseEntity<TeacherResponse> create(@Valid @RequestBody CreateTeacherRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teacherService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin giáo viên")
    public ResponseEntity<TeacherResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateTeacherRequest request) {
        return ResponseEntity.ok(teacherService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa giáo viên (phải không có lớp)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        teacherService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reset-password")
    @Operation(summary = "Reset mật khẩu giáo viên")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id) {
        teacherService.resetPassword(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/lock")
    @Operation(summary = "Khóa tài khoản giáo viên")
    public ResponseEntity<Void> lockAccount(@PathVariable Long id) {
        teacherService.lockAccount(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/unlock")
    @Operation(summary = "Mở khóa tài khoản giáo viên")
    public ResponseEntity<Void> unlockAccount(@PathVariable Long id) {
        teacherService.unlockAccount(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "Lấy thống kê giáo viên")
    public ResponseEntity<TeacherStatsResponse> getStats() {
        return ResponseEntity.ok(teacherService.getStats());
    }
}
