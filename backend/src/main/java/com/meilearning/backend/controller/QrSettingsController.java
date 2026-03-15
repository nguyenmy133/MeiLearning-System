package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.meilearning.backend.dto.request.UpdateQrSettingsRequest;
import com.meilearning.backend.dto.response.QrSettingsResponse;
import com.meilearning.backend.service.QrSettingsService;
@RestController
@RequestMapping("/api/v1/qr-settings")
@RequiredArgsConstructor
@Tag(name = "QR Settings", description = "Cấu hình QR check-in")
@PreAuthorize("hasRole('admin')")
public class QrSettingsController {

    private final QrSettingsService qrSettingsService;

    @GetMapping
    @Operation(summary = "Lấy cấu hình QR hiện tại")
    public ResponseEntity<QrSettingsResponse> getSettings() {
        return ResponseEntity.ok(qrSettingsService.getSettings());
    }

    @PutMapping
    @Operation(summary = "Cập nhật cấu hình QR")
    public ResponseEntity<QrSettingsResponse> updateSettings(
            @Valid @RequestBody UpdateQrSettingsRequest request) {
        return ResponseEntity.ok(qrSettingsService.updateSettings(request));
    }
}
