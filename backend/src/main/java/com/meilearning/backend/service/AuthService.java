package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.ChangePasswordRequest;
import com.meilearning.backend.dto.request.LoginRequest;
import com.meilearning.backend.dto.response.AccessTokenResponse;
import com.meilearning.backend.dto.response.LoginResponse;
import com.meilearning.backend.dto.response.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Service interface: Authentication & Authorization.
 */
public interface AuthService {

    /** Đăng nhập → trả user info + access token, set HttpOnly cookie chứa refresh token */
    LoginResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse response);

    /** Dùng refresh token từ cookie → trả access token mới */
    AccessTokenResponse refresh(HttpServletRequest request, HttpServletResponse response);

    /** Logout → revoke refresh token, xoá cookie */
    void logout(HttpServletRequest request, HttpServletResponse response);

    /** Đổi mật khẩu cho user hiện tại */
    void changePassword(String username, ChangePasswordRequest request);

    /** Lấy thông tin user hiện tại từ username */
    UserResponse getCurrentUser(String username);
}
