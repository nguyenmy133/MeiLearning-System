package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.meilearning.backend.dto.request.SendNotificationRequest;
import com.meilearning.backend.dto.response.NotificationResponse;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.service.NotificationService;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification", description = "Quản lý thông báo")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Lấy danh sách thông báo của user hiện tại")
    public ResponseEntity<PageResponse<NotificationResponse>> getAll(
            Principal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(notificationService.getByUser(principal.getName(), page, limit));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Đánh dấu đã đọc 1 thông báo")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Đánh dấu đã đọc tất cả thông báo")
    public ResponseEntity<Void> markAllRead(Principal principal) {
        notificationService.markAllAsRead(principal.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/send")
    @Operation(summary = "Admin gửi thông báo chủ động")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Map<String, String>> sendNotification(
            Principal principal,
            @Valid @RequestBody SendNotificationRequest request) {
        notificationService.sendNotification(request, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Thông báo đã được gửi thành công"));
    }
}
