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
        
        // Dọn emitter cũ (nếu có) — ngăn 2 connection song song gây duplicate events
        SseEmitter oldEmitter = emitters.put(username, emitter);
        if (oldEmitter != null) {
            try { oldEmitter.complete(); } catch (Exception ignored) {}
            log.debug("SSE Replaced old emitter for user: {}", username);
        }
        
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
     * Gửi tin payload thời gian thực xuống trình duyệt của User.
     * Không dùng completeWithError() — tạo ra exception propagation qua Security filter chain.
     * IOException khi client đóng tab là expected — chỉ cần cleanup emitter và log DEBUG.
     */
    public void sendNotification(String username, Object payload) {
        SseEmitter emitter = emitters.get(username);
        if (emitter == null) return;
        try {
            String jsonData = objectMapper.writeValueAsString(payload);
            emitter.send(SseEmitter.event()
                    .name("NEW_NOTIFICATION")
                    .data(jsonData));
        } catch (IOException e) {
            // Broken pipe / client disconnect — expected, NOT an error
            removeEmitter(username, emitter);
            log.debug("SSE client disconnected for user '{}': {}", username, e.getMessage());
        }
    }

    /**
     * Helper: đảm bảo emitter được complete() đúng cách trước khi xóa khỏi registry.
     * Gọi complete() thay vì completeWithError() — tử mầu do đóng đầu, không phải do lỗi.
     */
    private void removeEmitter(String username, SseEmitter emitter) {
        emitters.remove(username, emitter);
        try { emitter.complete(); } catch (Exception ignored) {}
    }

    /**
     * Gửi Heartbeat mỗi 30s để chống ngắt kết nối rảnh rỗi của Caddy/Nginx.
     */
    @Scheduled(fixedRate = 30000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;
        emitters.forEach((username, emitter) -> {
            try {
                emitter.send(SseEmitter.event().name("PING").data("Heartbeat"));
            } catch (IOException e) {
                // Client disconnected silently — cleanup without error log
                removeEmitter(username, emitter);
                log.debug("SSE heartbeat: removed stale emitter for user '{}'", username);
            }
        });
    }
}
