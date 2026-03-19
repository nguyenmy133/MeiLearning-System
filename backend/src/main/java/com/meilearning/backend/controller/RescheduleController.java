package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.meilearning.backend.dto.request.CreateRescheduleRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.RescheduleRequestResponse;
import com.meilearning.backend.service.RescheduleService;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reschedule")
@RequiredArgsConstructor
@Tag(name = "Reschedule", description = "Quản lý dời lịch")
@PreAuthorize("hasAnyRole('admin', 'teacher')")
public class RescheduleController {

    private final RescheduleService rescheduleService;

    @GetMapping
    @Operation(summary = "Danh sách yêu cầu dời lịch (admin)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<PageResponse<RescheduleRequestResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(rescheduleService.getAll(status, page, limit));
    }

    /**
     * Lấy yêu cầu của teacher đang đăng nhập.
     * Resolve teacher từ JWT — KHÔNG cần truyền teacherId từ FE.
     */
    @GetMapping("/teacher/me")
    @Operation(summary = "Yêu cầu đổi lịch của giáo viên đang đăng nhập")
    @PreAuthorize("hasRole('teacher')")
    public ResponseEntity<List<RescheduleRequestResponse>> getMyRequests(Principal principal) {
        return ResponseEntity.ok(rescheduleService.getByTeacherUsername(principal.getName()));
    }

    @GetMapping("/teacher/{teacherId}")
    @Operation(summary = "Yêu cầu theo giáo viên (admin)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<RescheduleRequestResponse>> getByTeacher(
            @PathVariable Long teacherId) {
        return ResponseEntity.ok(rescheduleService.getByTeacher(teacherId));
    }

    /**
     * Teacher tạo yêu cầu — resolve teacherId từ JWT, FE không truyền teacherId.
     * An toàn hơn endpoint POST / cũ vì không thể giả mạo teacherId.
     */
    @PostMapping("/teacher/me")
    @Operation(summary = "Tạo yêu cầu đổi lịch (Teacher, JWT-resolved)")
    @PreAuthorize("hasRole('teacher')")
    public ResponseEntity<RescheduleRequestResponse> createByMe(
            Principal principal,
            @Valid @RequestBody CreateRescheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(rescheduleService.createByUsername(principal.getName(), request));
    }

    @PostMapping
    @Operation(summary = "Tạo yêu cầu dời lịch (legacy — cần teacherId)")
    public ResponseEntity<RescheduleRequestResponse> create(
            @Valid @RequestBody CreateRescheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rescheduleService.create(request));
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Duyệt yêu cầu (Admin)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<RescheduleRequestResponse> approve(
            @PathVariable Long id,
            @RequestParam String reviewedBy) {
        return ResponseEntity.ok(rescheduleService.approve(id, reviewedBy));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Từ chối yêu cầu (Admin)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<RescheduleRequestResponse> reject(
            @PathVariable Long id,
            @RequestParam String reviewedBy,
            @RequestParam String reason) {
        return ResponseEntity.ok(rescheduleService.reject(id, reviewedBy, reason));
    }
}
