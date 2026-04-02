package com.meilearning.backend.service;

import com.meilearning.backend.entity.RefreshToken;
import com.meilearning.backend.entity.User;

public interface RefreshTokenService {

    /**
     * Tạo refresh token mới cho user trên một thiết bị.
     * Multi-device: không xoá token cũ, mỗi login = 1 session riêng.
     * Giới hạn tối đa MAX_SESSIONS session/user (xoá session cũ nhất nếu vượt).
     *
     * @param deviceId   fingerprint của thiết bị (từ User-Agent)
     * @param rememberMe true → 30 ngày, false → 7 ngày
     */
    RefreshToken create(User user, String deviceId, boolean rememberMe);

    /**
     * Tìm và validate refresh token.
     * @throws com.meilearning.backend.exception.BusinessException nếu không hợp lệ/hết hạn
     */
    RefreshToken verify(String token);

    /** Revoke token của thiết bị hiện tại khi logout */
    void revoke(String token);

    /** Revoke toàn bộ session của user (đổi mật khẩu, force logout) */
    void revokeAll(User user);

    /** Xoá token hết hạn — gọi bởi scheduled job */
    void cleanupExpired();
}
