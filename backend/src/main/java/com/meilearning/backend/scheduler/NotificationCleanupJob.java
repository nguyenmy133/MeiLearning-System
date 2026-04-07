package com.meilearning.backend.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.repository.NotificationRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Dọn dẹp thông báo cũ theo 2 chiến lược:
 *
 * 1. Xóa hàng đã đọc + đã hết hạn (expiresAt < now)
 * 2. Fallback: xóa hàng đã đọc > 90 ngày khi không có expiresAt (legacy rows)
 *
 * Chạy lúc 02:00 AM mỗi ngày.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationCleanupJob {

    private final NotificationRepository notificationRepository;

    /** Fallback TTL cho các row không có expiresAt (legacy) */
    private static final long LEGACY_TTL_DAYS = 90;

    @Scheduled(cron = "0 0 2 * * *") // 02:00 AM hàng ngày
    @Transactional
    public void cleanupExpiredNotifications() {
        Instant now = Instant.now();
        Instant legacyCutoff = now.minus(LEGACY_TTL_DAYS, ChronoUnit.DAYS);

        int deletedExpired = notificationRepository.deleteExpiredRead(now);
        int deletedLegacy  = notificationRepository.deleteOldReadWithoutExpiry(legacyCutoff);

        int total = deletedExpired + deletedLegacy;
        if (total > 0) {
            log.info("[NotificationCleanup] Đã xóa {} thông báo cũ ({} hết hạn + {} legacy > {} ngày)",
                    total, deletedExpired, deletedLegacy, LEGACY_TTL_DAYS);
        }
    }
}
