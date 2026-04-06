package com.meilearning.backend.service.impl;

import com.meilearning.backend.service.SmsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * SpeedSMS implementation — gọi REST API tại https://api.speedsms.vn
 *
 * Auth: HTTP Basic (api_key : x)
 * Endpoint: POST /index.php/sms/send
 * Body: { "to": "849xxx", "content": "...", "sms_type": 4, "sender": "Notify" }
 */
@Slf4j
@Service
public class SpeedSmsServiceImpl implements SmsService {

    private static final String API_URL = "https://api.speedsms.vn/index.php/sms/send";

    @Value("${app.sms.enabled:false}")
    private boolean enabled;

    @Value("${app.sms.api-key:}")
    private String apiKey;

    @Value("${app.sms.sender:Notify}")
    private String sender;

    @Value("${app.sms.type:4}")
    private int smsType;

    @Value("${app.sms.max-per-day:3}")
    private int maxPerDay;
    private final RestTemplate restTemplate = new RestTemplate();

    // Rate limit tracking: phone → { date → count }
    private final Map<String, DailyCounter> dailyCounters = new ConcurrentHashMap<>();

    @Override
    public boolean sendSms(String phoneNumber, String message) {
        if (!enabled) {
            log.debug("📱 SMS disabled — skipping send to {}", phoneNumber);
            return false;
        }
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("⚠️ SpeedSMS API key not configured — SMS skipped to {}", phoneNumber);
            return false;
        }

        // Normalize phone (0xxx → 84xxx)
        String normalizedPhone = normalizePhone(phoneNumber);

        // Rate limit check
        if (isRateLimited(normalizedPhone)) {
            log.warn("⚠️ SMS rate limited for {} (max {}/day)", normalizedPhone, maxPerDay);
            return false;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // SpeedSMS Basic Auth: api_key:x (base64 encoded)
            String auth = Base64.getEncoder().encodeToString(
                    (apiKey + ":x").getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + auth);

            String smsContent = truncate(message, 160);
            Map<String, Object> body = new java.util.HashMap<>();
            body.put("to", new String[]{normalizedPhone});
            body.put("content", smsContent);
            body.put("sms_type", smsType);
            // sender only required for type 3 (custom brandname) and type 4 (default brandname)
            if (smsType >= 3 && sender != null && !sender.isBlank()) {
                body.put("sender", sender);
            }

            log.info("📱 Sending SMS to {} [type={}, sender={}]: {}", normalizedPhone, smsType, sender,
                    truncate(smsContent, 50));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    API_URL, HttpMethod.POST, request, (Class<Map<String, Object>>) (Class<?>) Map.class);

            Map<?, ?> responseBody = response.getBody();
            log.info("📱 SpeedSMS response [{}]: {}", response.getStatusCode(), responseBody);

            if (response.getStatusCode().is2xxSuccessful()
                    && responseBody != null && "success".equals(responseBody.get("status"))) {
                log.info("✅ SMS delivered to {}", normalizedPhone);
                incrementCounter(normalizedPhone);
                return true;
            } else {
                log.error("❌ SpeedSMS error [{}]: {}", response.getStatusCode(), responseBody);
            }
        } catch (Exception e) {
            log.error("❌ Failed to send SMS to {}: {}", normalizedPhone, e.getMessage(), e);
        }

        return false;
    }

    /**
     * Normalize số điện thoại: 0973xxx → 84973xxx
     */
    private String normalizePhone(String phone) {
        if (phone == null) return "";
        phone = phone.replaceAll("[^0-9]", ""); // remove non-digits
        if (phone.startsWith("0")) {
            return "84" + phone.substring(1);
        }
        if (!phone.startsWith("84")) {
            return "84" + phone;
        }
        return phone;
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() <= maxLen ? text : text.substring(0, maxLen - 3) + "...";
    }

    private boolean isRateLimited(String phone) {
        String today = java.time.LocalDate.now().toString();
        DailyCounter counter = dailyCounters.computeIfAbsent(phone, k -> new DailyCounter());
        if (!today.equals(counter.date)) {
            counter.date = today;
            counter.count.set(0);
        }
        return counter.count.get() >= maxPerDay;
    }

    private void incrementCounter(String phone) {
        String today = java.time.LocalDate.now().toString();
        DailyCounter counter = dailyCounters.computeIfAbsent(phone, k -> new DailyCounter());
        if (!today.equals(counter.date)) {
            counter.date = today;
            counter.count.set(0);
        }
        counter.count.incrementAndGet();
    }

    private static class DailyCounter {
        volatile String date = "";
        final AtomicInteger count = new AtomicInteger(0);
    }
}
