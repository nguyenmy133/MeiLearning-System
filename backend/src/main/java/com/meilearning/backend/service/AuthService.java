package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.ChangePasswordRequest;
import com.meilearning.backend.dto.request.LoginRequest;
import com.meilearning.backend.dto.response.LoginResponse;
import com.meilearning.backend.dto.response.UserResponse;

/**
 * Service interface: Authentication & Authorization.
 */
public interface AuthService {

    /** ÄÄƒng nháº­p â†’ tráº£ vá» user info + JWT access token */
    LoginResponse login(LoginRequest request);

    /** Äá»•i máº­t kháº©u cho user hiá»‡n táº¡i */
    void changePassword(String username, ChangePasswordRequest request);

    /** Láº¥y thĂ´ng tin user hiá»‡n táº¡i tá»« username */
    UserResponse getCurrentUser(String username);
}
