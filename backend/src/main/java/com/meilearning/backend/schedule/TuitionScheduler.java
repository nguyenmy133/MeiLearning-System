package com.meilearning.backend.schedule;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.meilearning.backend.service.TuitionService;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
@Slf4j
public class TuitionScheduler {

    private final TuitionService tuitionService;

    /**
     * Chạy tự động vào 00:01 sáng ngày mùng 1 hàng tháng.
     * Tạo hóa đơn học phí cho học viên dựa trên dữ liệu của tháng liền trước đó.
     */
    @Scheduled(cron = "0 1 0 1 * ?")
    public void generateTuitionForPreviousMonth() {
        log.info("🚀 Tự động chạy tiến trình tạo hóa đơn học phí cho tháng trước...");
        try {
            // Lấy tháng trước định dạng MM/yyyy
            String previousMonth = LocalDate.now().minusMonths(1).format(DateTimeFormatter.ofPattern("MM/yyyy"));
            
            log.info("Bắt đầu sinh hóa đơn cho tháng: {}", previousMonth);
            var results = tuitionService.generateMonthlyInvoices(previousMonth);
            log.info("✅ Hoàn tất sinh hóa đơn tự động. Tổng cộng: {} hóa đơn đã được tạo.", results.size());
            
        } catch (Exception e) {
            log.error("❌ Lỗi khi tự động chạy tiến trình tạo hóa đơn: {}", e.getMessage(), e);
        }
    }
}
