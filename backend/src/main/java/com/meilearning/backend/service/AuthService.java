package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.ChangePasswordRequest;
import com.meilearning.backend.dto.request.LoginRequest;
import com.meilearning.backend.dto.response.LoginResponse;
import com.meilearning.backend.dto.response.UserResponse;

/**

 * Service interface: Authentication & Authorization.

 */

public interface AuthService {

    /** ÄÄƒng nhập â†’ trả về user info + JWT access token */

    LoginResponse login(LoginRequest request);

    /** Äá»•i máºít khẩu cho user hiện tại */

    void changePassword(String username, ChangePasswordRequest request);

    /** Lấy thông tin user hiện tại từ username */

    UserResponse getCurrentUser(String username);

}
