package meilearning.com.backend.service;

import meilearning.com.backend.dto.request.ChangePasswordRequest;
import meilearning.com.backend.dto.request.LoginRequest;
import meilearning.com.backend.dto.response.LoginResponse;

/**
 * Service interface: Authentication & Authorization.
 */
public interface AuthService {

    /** Đăng nhập → trả về user info + JWT access token */
    LoginResponse login(LoginRequest request);

    /** Đổi mật khẩu cho user hiện tại */
    void changePassword(String username, ChangePasswordRequest request);
}
