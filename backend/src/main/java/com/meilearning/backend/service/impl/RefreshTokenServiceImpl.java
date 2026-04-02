package com.meilearning.backend.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.meilearning.backend.entity.RefreshToken;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.exception.BusinessException;
import com.meilearning.backend.repository.RefreshTokenRepository;
import com.meilearning.backend.service.RefreshTokenService;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    /** Số session tối đa mỗi user — session cũ nhất bị xoá khi vượt giới hạn */
    private static final int MAX_SESSIONS = 5;

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    @Value("${app.jwt.refresh-remember-me-ms:2592000000}")
    private long refreshRememberMeMs;

    @Override
    @Transactional
    public RefreshToken create(User user, String deviceId, boolean rememberMe) {
        // Kiểm tra và giới hạn số session — xoá session cũ nhất nếu vượt MAX_SESSIONS
        List<RefreshToken> sessions = refreshTokenRepository.findByUserOrderByCreatedAtDesc(user);
        if (sessions.size() >= MAX_SESSIONS) {
            // Xóa các session cũ nhất vượt giới hạn
            sessions.subList(MAX_SESSIONS - 1, sessions.size())
                    .forEach(old -> refreshTokenRepository.deleteByToken(old.getToken()));
            log.debug("Removed {} old session(s) for user {} (limit: {})",
                    sessions.size() - MAX_SESSIONS + 1, user.getUsername(), MAX_SESSIONS);
        }

        long durationMs = rememberMe ? refreshRememberMeMs : refreshExpirationMs;
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .deviceId(deviceId)
                .expiresAt(Instant.now().plusMillis(durationMs))
                .rememberMe(rememberMe)
                .revoked(false)
                .build();

        return java.util.Objects.requireNonNull(refreshTokenRepository.save(token));
    }

    @Override
    @Transactional(readOnly = true)
    public RefreshToken verify(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Refresh token không hợp lệ."));

        if (!refreshToken.isValid()) {
            throw new BusinessException("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }

        return refreshToken;
    }

    @Override
    @Transactional
    public void revoke(String token) {
        // Chỉ xoá token của thiết bị này — không ảnh hưởng thiết bị khác
        refreshTokenRepository.deleteByToken(token);
    }

    @Override
    @Transactional
    public void revokeAll(User user) {
        // Xoá toàn bộ session — dùng khi đổi mật khẩu hoặc force logout
        refreshTokenRepository.deleteByUser(user);
        log.info("Revoked all sessions for user: {}", user.getUsername());
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 3 * * *") // Chạy 3:00 AM mỗi ngày
    public void cleanupExpired() {
        refreshTokenRepository.deleteExpiredTokens(Instant.now());
        log.info("Cleaned up expired refresh tokens");
    }
}
