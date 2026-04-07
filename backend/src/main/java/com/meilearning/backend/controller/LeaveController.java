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
import com.meilearning.backend.util.CurrentUserResolver;
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
    private final CurrentUserResolver currentUser;

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
            Principal principal,
            @RequestParam(required = false) String requesterType) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(leaveService.getStats(requesterType, username));
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

    /**
     * Đơn nghỉ của user đang đăng nhập — resolve từ JWT.
     */
    @GetMapping("/me")
    @Operation(summary = "Đơn nghỉ phép của người dùng đang đăng nhập")
    public ResponseEntity<List<LeaveRequestResponse>> getMyLeaves(Principal principal) {
        User user = currentUser.getUser();
        return ResponseEntity.ok(leaveService.getByRequester(user.getId()));
    }

    @GetMapping("/requester/{requesterId}")
    @Operation(summary = "Đơn theo người gửi (admin)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<LeaveRequestResponse>> getByRequester(
            @PathVariable Long requesterId) {
        return ResponseEntity.ok(leaveService.getByRequester(requesterId));
    }

    /**
     * Tạo đơn nghỉ phép — resolve requesterId từ JWT.
     */
    @PostMapping
    @Operation(summary = "Tạo đơn nghỉ phép")
    public ResponseEntity<LeaveRequestResponse> create(
            Principal principal,
            @Valid @RequestBody CreateLeaveRequest request) {
        // Override requesterId từ JWT — chống giả mạo
        User user = currentUser.getUser();
        request.setRequesterId(user.getId());
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
        User reviewer = currentUser.getUser();
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
        User reviewer = currentUser.getUser();
        return ResponseEntity.ok(leaveService.reject(id, reviewer.getId(), reason));
    }

    /**
     * Học viên tự huỷ đơn đang chờ duyệt — resolve requesterId từ JWT.
     */
    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Huỷ đơn (chỉ người gửi, khi đang pending)")
    public ResponseEntity<Void> cancel(
            Principal principal,
            @PathVariable Long id) {
        User user = currentUser.getUser();
        leaveService.cancel(id, user.getId());
        return ResponseEntity.ok().build();
    }
}
