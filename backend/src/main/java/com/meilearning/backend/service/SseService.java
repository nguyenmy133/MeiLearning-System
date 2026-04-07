package com.meilearning.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class SseService {

    // Liên kết Username với SseEmitter tương ứng
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public SseService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Tạo một luồng kết nối SSE mới cho User.
     * Cấu hình Timeout là không giới hạn (-1L).
     */
    public SseEmitter createEmitter(String username) {
        SseEmitter emitter = new SseEmitter(-1L);
        
        // Giải phóng tài nguyên khi kết nối đóng/lỗi
        emitter.onCompletion(() -> {
            emitters.remove(username, emitter);
            log.debug("SSE Emitter completed for user: {}", username);
        });

        emitter.onTimeout(() -> {
            emitter.complete();
            emitters.remove(username, emitter);
            log.debug("SSE Emitter timed out for user: {}", username);
        });

        emitter.onError((e) -> {
            emitters.remove(username, emitter);
            log.debug("SSE Emitter error for user: {}", username);
        });
        
        emitters.put(username, emitter);
        
        try {
            // Gửi sự kiện ban đầu để xác nhận nối thành công
            emitter.send(SseEmitter.event()
                    .name("CONNECT")
                    .data("Connected to Notification Stream"));
        } catch (IOException e) {
            emitters.remove(username, emitter);
        }

        return emitter;
    }

    /**
     * Gửi tin payload mang tính chất thời gian thực xuống trình duyệt của User
     */
    public void sendNotification(String username, Object payload) {
        SseEmitter emitter = emitters.get(username);
        if (emitter != null) {
            try {
                // Parse payload qua JSON string để tương thích 100% với EventSource Text
                String jsonData = objectMapper.writeValueAsString(payload);
                emitter.send(SseEmitter.event()
                        .name("NEW_NOTIFICATION")
                        .data(jsonData));
            } catch (IOException e) {
                emitter.completeWithError(e);
                emitters.remove(username, emitter);
                log.error("Failed to send SSE notification to user: {}", username);
            }
        }
    }

    /**
     * Gửi Heartbeat mỗi 30s để chống lại thói quen ngắt kết nối rảnh rỗi của Caddy/Nginx.
     * Cực kỳ quan trọng trên VPS.
     */
    @Scheduled(fixedRate = 30000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;
        
        emitters.forEach((username, emitter) -> {
            try {
                emitter.send(SseEmitter.event().name("PING").data("Heartbeat"));
            } catch (IOException e) {
                emitter.complete();
                emitters.remove(username, emitter);
            }
        });
    }
}
