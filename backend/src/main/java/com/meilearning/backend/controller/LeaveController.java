package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.meilearning.backend.dto.request.CreateLeaveRequest;
import com.meilearning.backend.dto.response.LeaveRequestResponse;
import com.meilearning.backend.dto.response.LeaveStatsResponse;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.repository.UserRepository;
import com.meilearning.backend.service.LeaveService;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leave")
@RequiredArgsConstructor
@Tag(name = "Leave", description = "Quản lý nghỉ phép")
@PreAuthorize("hasAnyRole('admin', 'teacher', 'student')")
public class LeaveController {

    private final LeaveService leaveService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Danh sách đơn nghỉ phép")
    public ResponseEntity<PageResponse<LeaveRequestResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String requesterType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(leaveService.getAll(status, requesterType, page, limit));
    }

    /**
     * Thống kê số lượng đơn theo trạng thái.
     * Teacher gọi với requesterType=student để xem đơn của học viên trong lớp.
     */
    @GetMapping("/stats")
    @Operation(summary = "Thống kê đơn theo trạng thái")
    public ResponseEntity<LeaveStatsResponse> getStats(
            @RequestParam(required = false) String requesterType) {
        return ResponseEntity.ok(leaveService.getStats(requesterType));
    }

    /**
     * Lấy đơn nghỉ phép trong các buổi học của teacher đang đăng nhập.
     * Backend resolve teacher từ JWT — không cần truyền teacherId.
     */
    @GetMapping("/teacher/me")
    @Operation(summary = "Đơn nghỉ phép thuộc lớp của giáo viên đang đăng nhập")
    @PreAuthorize("hasRole('teacher')")
    public ResponseEntity<List<LeaveRequestResponse>> getMyTeacherLeaves(
            Principal principal,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(leaveService.getByTeacherUsername(principal.getName(), status));
    }

    @GetMapping("/requester/{requesterId}")
    @Operation(summary = "Đơn theo người gửi")
    public ResponseEntity<List<LeaveRequestResponse>> getByRequester(
            @PathVariable Long requesterId) {
        return ResponseEntity.ok(leaveService.getByRequester(requesterId));
    }

    @PostMapping
    @Operation(summary = "Tạo đơn nghỉ phép")
    public ResponseEntity<LeaveRequestResponse> create(
            @Valid @RequestBody CreateLeaveRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveService.create(request));
    }

    /**
     * Duyệt đơn — teacher/admin duyệt.
     * reviewerId resolve từ JWT để tránh FE truyền sai ID.
     */
    @PatchMapping("/{id}/approve")
    @Operation(summary = "Duyệt đơn (Teacher/Admin)")
    @PreAuthorize("hasAnyRole('admin', 'teacher')")
    public ResponseEntity<LeaveRequestResponse> approve(
            Principal principal,
            @PathVariable Long id) {
        User reviewer = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new com.meilearning.backend.exception.ResourceNotFoundException("Reviewer not found"));
        return ResponseEntity.ok(leaveService.approve(id, reviewer.getId()));
    }

    /**
     * Từ chối đơn — teacher/admin từ chối.
     * reviewerId resolve từ JWT.
     */
    @PatchMapping("/{id}/reject")
    @Operation(summary = "Từ chối đơn (Teacher/Admin)")
    @PreAuthorize("hasAnyRole('admin', 'teacher')")
    public ResponseEntity<LeaveRequestResponse> reject(
            Principal principal,
            @PathVariable Long id,
            @RequestParam String reason) {
        User reviewer = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new com.meilearning.backend.exception.ResourceNotFoundException("Reviewer not found"));
        return ResponseEntity.ok(leaveService.reject(id, reviewer.getId(), reason));
    }
}
