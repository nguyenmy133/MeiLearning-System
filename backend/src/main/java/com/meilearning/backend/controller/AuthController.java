/**
 * REST Controller: Authentication endpoints.
 * Base path: /api/v1/auth
 */
package com.meilearning.backend.controller;

import java.security.Principal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.meilearning.backend.dto.request.ChangePasswordRequest;
import com.meilearning.backend.dto.request.LoginRequest;
import com.meilearning.backend.dto.response.LoginResponse;
import com.meilearning.backend.dto.response.UserResponse;
import com.meilearning.backend.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Xác thực & phân quyền")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin user hiện tại")
    public ResponseEntity<UserResponse> me(Principal principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal.getName()));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu")
    public ResponseEntity<Void> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal.getName(), request);
        return ResponseEntity.noContent().build();
    }
}
