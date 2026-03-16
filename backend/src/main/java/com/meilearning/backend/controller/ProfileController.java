package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.meilearning.backend.dto.request.UpdateProfileRequest;
import com.meilearning.backend.dto.response.ProfileResponse;
import com.meilearning.backend.service.ProfileService;
import java.security.Principal;
import java.util.Map;
@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "Quản lý hồ sơ cá nhân")
@PreAuthorize("isAuthenticated()")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin cá nhân")
    public ResponseEntity<ProfileResponse> getProfile(Principal principal) {
        return ResponseEntity.ok(profileService.getProfile(principal.getName()));
    }

    @PutMapping("/me")
    @Operation(summary = "Cập nhật thông tin cá nhân")
    public ResponseEntity<ProfileResponse> updateProfile(
            Principal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(principal.getName(), request));
    }

    @PostMapping("/avatar")
    @Operation(summary = "Upload avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            Principal principal,
            @RequestParam("avatar") MultipartFile file) {
        String avatarUrl = profileService.uploadAvatar(principal.getName(), file);
        return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
    }
}
