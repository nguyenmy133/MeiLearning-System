package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.meilearning.backend.dto.response.NotificationResponse;
import com.meilearning.backend.service.NotificationService;
import java.security.Principal;
import java.util.List;
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification", description = "Quản lý thông báo")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Lấy danh sách thông báo của user hiện tại")
    public ResponseEntity<List<NotificationResponse>> getAll(Principal principal) {
        return ResponseEntity.ok(notificationService.getByUser(principal.getName()));
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
}
