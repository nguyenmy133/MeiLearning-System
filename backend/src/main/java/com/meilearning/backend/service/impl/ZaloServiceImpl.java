package com.meilearning.backend.service.impl;

import com.meilearning.backend.service.ZaloService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Zalo Official Account — ZNS (Zalo Notification Service) integration.
 *
 * Flow:
 *   1. Lấy access_token từ refresh_token (auto-refresh khi hết hạn 25h)
 *   2. Gọi ZNS API gửi template message đến số điện thoại
 *
 * Nếu chưa cấu hình (app-id / app-secret rỗng) → skip + log warning
 */
@Slf4j
@Service
public class ZaloServiceImpl implements ZaloService {

    private static final String TOKEN_URL = "https://oauth.zaloapp.com/v4/oa/access_token";
    private static final String ZNS_URL = "https://business.openapi.zalo.me/message/template";

    @Value("${app.zalo.enabled:false}")
    private boolean enabled;

    @Value("${app.zalo.app-id:}")
    private String appId;

    @Value("${app.zalo.app-secret:}")
    private String appSecret;

    @Value("${app.zalo.refresh-token:}")
    private String refreshToken;

    @Value("${app.zalo.zns-template-id:}")
    private String defaultTemplateId;

    private final RestTemplate restTemplate = new RestTemplate();

    // Cached access token
    private volatile String accessToken;
    private volatile long tokenExpiresAt = 0;

    @Override
    public boolean isEnabled() {
        return enabled
                && appId != null && !appId.isBlank()
                && appSecret != null && !appSecret.isBlank();
    }

    @Override
    @Async("notificationExecutor")
    public boolean sendZns(String phone, String templateId, Map<String, String> data) {
        if (!isEnabled()) {
            log.debug("⚠️ Zalo OA not configured — ZNS skipped to {}", phone);
            return false;
        }

        String tid = (templateId != null && !templateId.isBlank()) ? templateId : defaultTemplateId;
        if (tid == null || tid.isBlank()) {
            log.warn("⚠️ No ZNS template ID — cannot send to {}", phone);
            return false;
        }

        try {
            String token = getAccessToken();
            if (token == null) {
                log.error("❌ Cannot obtain Zalo access token");
                return false;
            }

            // Normalize phone: 0xxx → 84xxx
            String normalizedPhone = normalizePhone(phone);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("access_token", token);

            Map<String, Object> body = new HashMap<>();
            body.put("phone", normalizedPhone);
            body.put("template_id", tid);
            body.put("template_data", data);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    ZNS_URL, HttpMethod.POST, request,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                Map<?, ?> resBody = response.getBody();
                if (resBody != null && Integer.valueOf(0).equals(resBody.get("error"))) {
                    log.info("📱 ZNS sent to {}: template={}", normalizedPhone, tid);
                    return true;
                } else {
                    log.error("❌ ZNS error: {}", resBody);
                }
            }
        } catch (Exception e) {
            log.error("❌ ZNS failed to {}: {}", phone, e.getMessage());
        }
        return false;
    }

    /**
     * Lấy hoặc refresh access token (hết hạn sau 25h).
     */
    private synchronized String getAccessToken() {
        if (accessToken != null && System.currentTimeMillis() < tokenExpiresAt) {
            return accessToken;
        }

        if (refreshToken == null || refreshToken.isBlank()) {
            log.warn("⚠️ Zalo refresh_token not configured");
            return null;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("secret_key", appSecret);

            String formBody = "refresh_token=" + refreshToken
                    + "&app_id=" + appId
                    + "&grant_type=refresh_token";

            HttpEntity<String> request = new HttpEntity<>(formBody, headers);
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    TOKEN_URL, HttpMethod.POST, request,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);

            Map<?, ?> body = response.getBody();
            if (body != null && body.containsKey("access_token")) {
                accessToken = (String) body.get("access_token");
                // Token expires in ~25h, refresh 1h before
                tokenExpiresAt = System.currentTimeMillis() + 24 * 60 * 60 * 1000L;

                // Update refresh token if returned
                if (body.containsKey("refresh_token")) {
                    refreshToken = (String) body.get("refresh_token");
                }

                log.info("✅ Zalo access token refreshed");
                return accessToken;
            } else {
                log.error("❌ Zalo token refresh failed: {}", body);
            }
        } catch (Exception e) {
            log.error("❌ Zalo token refresh error: {}", e.getMessage());
        }
        return null;
    }

    private String normalizePhone(String phone) {
        if (phone == null) return "";
        phone = phone.replaceAll("[^0-9]", "");
        if (phone.startsWith("0")) {
            return "84" + phone.substring(1);
        }
        if (!phone.startsWith("84")) {
            return "84" + phone;
        }
        return phone;
    }
}
