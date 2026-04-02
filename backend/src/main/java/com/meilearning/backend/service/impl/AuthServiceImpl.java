package com.meilearning.backend.service.impl;

import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import com.meilearning.backend.dto.request.ChangePasswordRequest;
import com.meilearning.backend.dto.request.LoginRequest;
import com.meilearning.backend.dto.response.AccessTokenResponse;
import com.meilearning.backend.dto.response.LoginResponse;
import com.meilearning.backend.dto.response.UserResponse;
import com.meilearning.backend.entity.RefreshToken;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.exception.BusinessException;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.repository.UserRepository;
import com.meilearning.backend.security.JwtTokenProvider;
import com.meilearning.backend.service.AuthService;
import com.meilearning.backend.service.RefreshTokenService;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.jwt.refresh-cookie-name:refresh_token}")
    private String refreshCookieName;

    @Value("${app.jwt.cookie.secure:false}")
    private boolean cookieSecure;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse response) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("Tên đăng nhập hoặc mật khẩu không đúng"));

        if (!user.isActive()) {
            throw new BusinessException("Tài khoản đã bị khóa. Liên hệ quản trị viên.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        // Tạo access token (ngắn hạn — 15 phút)
        String accessToken = jwtTokenProvider.generateToken(
                user.getId(), user.getUsername(), user.getRole().name());

        // Tạo refresh token (dài hạn — 7 hoặc 30 ngày) và set vào HttpOnly cookie
        // deviceId = User-Agent để phân biệt thiết bị
        String deviceId = extractDeviceId(httpRequest);
        RefreshToken refreshToken = refreshTokenService.create(user, deviceId, request.isRememberMe());
        setRefreshCookie(response, refreshToken.getToken(), refreshToken.getExpiresAt().getEpochSecond());

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();

        return LoginResponse.builder()
                .user(userResponse)
                .accessToken(accessToken)
                .build();
    }

    @Override
    @Transactional
    public AccessTokenResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String tokenValue = extractRefreshCookie(request);
        if (tokenValue == null) {
            throw new BusinessException("Không tìm thấy refresh token. Vui lòng đăng nhập lại.");
        }

        RefreshToken refreshToken = refreshTokenService.verify(tokenValue);
        User user = refreshToken.getUser();

        // Rotate refresh token: tạo token mới, giữ nguyên deviceId và rememberMe của token cũ
        RefreshToken newRefreshToken = refreshTokenService.create(
                user, refreshToken.getDeviceId(), refreshToken.isRememberMe());
        setRefreshCookie(response, newRefreshToken.getToken(), newRefreshToken.getExpiresAt().getEpochSecond());

        String newAccessToken = jwtTokenProvider.generateToken(
                user.getId(), user.getUsername(), user.getRole().name());

        return AccessTokenResponse.builder()
                .accessToken(newAccessToken)
                .build();
    }

    @Override
    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String tokenValue = extractRefreshCookie(request);
        if (tokenValue != null) {
            refreshTokenService.revoke(tokenValue);
        }
        clearRefreshCookie(response);
    }

    @Override
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("Mật khẩu hiện tại không đúng");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    // ── Cookie helpers ──────────────────────────────────────────────────────────

    private void setRefreshCookie(HttpServletResponse response, String token, long maxAgeSeconds) {
        long maxAge = maxAgeSeconds - (System.currentTimeMillis() / 1000);
        String cookieName = refreshCookieName != null ? refreshCookieName : "refresh_token";
        ResponseCookie cookie = ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(cookieSecure)        // true = HTTPS only (production)
                .path("/api/v1/auth")
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        String cookieName = refreshCookieName != null ? refreshCookieName : "refresh_token";
        ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/v1/auth")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private String extractRefreshCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        return Arrays.stream(cookies)
                .filter(c -> refreshCookieName.equals(c.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);
    }

    /**
     * Lấy User-Agent rút gọn làm device identifier.
     * Dùng để phân biệt session trên các thiết bị khác nhau.
     */
    private String extractDeviceId(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null || userAgent.isBlank()) {
            return "unknown-device";
        }
        // Rút gọn User-Agent xuống 128 ký tự để vừa cột device_id
        return userAgent.length() > 128 ? userAgent.substring(0, 128) : userAgent;
    }
}
