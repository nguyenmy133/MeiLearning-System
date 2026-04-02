package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO cho login request.
 */
@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    /** true → refresh token 30 ngày, false → 7 ngày */
    private boolean rememberMe = false;
}

