package com.meilearning.backend.scheduler;

import com.meilearning.backend.repository.AttendanceQrTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Dọn dẹp QR token hết hạn — chạy hàng ngày lúc 2h sáng.
 * Sử dụng method deleteExpiredBefore() đã có sẵn trong repository.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class QrTokenCleanupScheduler {

    private final AttendanceQrTokenRepository qrTokenRepository;

    @Scheduled(cron = "0 0 2 * * *") // 02:00 mỗi ngày
    @Transactional
    public void cleanupExpiredTokens() {
        Instant now = Instant.now();
        qrTokenRepository.deleteExpiredBefore(now);
        log.info("QR token cleanup completed — removed tokens expired before {}", now);
    }
}
