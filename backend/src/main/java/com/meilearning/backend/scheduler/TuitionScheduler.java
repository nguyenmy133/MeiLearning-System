package com.meilearning.backend.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.meilearning.backend.entity.Student;
import com.meilearning.backend.entity.TuitionInvoice;
import com.meilearning.backend.entity.enums.InvoiceStatus;
import com.meilearning.backend.repository.TuitionInvoiceRepository;
import com.meilearning.backend.service.TuitionService;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Scheduler: Quản lý vòng đời hóa đơn học phí.
 *
 * - Ngày 1 hàng tháng  (00:01): Tự động tạo hóa đơn tháng trước.
 * - Mỗi ngày           (00:30): Đánh dấu hóa đơn quá hạn (pending → overdue),
 *                                đồng bộ Student.tuitionStatus,
 *                                gửi thông báo urgent cho học viên.
 * - Khi ứng dụng sẵn sàng (ApplicationReadyEvent): Chạy markOverdueInvoices()
 *                                để đảm bảo data nhất quán ngay sau khi restart.
 *
 * FIX #1: Dùng @EventListener(ApplicationReadyEvent) thay cho @PostConstruct.
 *   - @PostConstruct được gọi trên raw bean TRƯỚC khi Spring tạo CGLIB proxy,
 *     nên this.markOverdueInvoices() bỏ qua @Transactional hoàn toàn.
 *   - ApplicationReadyEvent được gọi SAU khi tất cả proxy đã sẵn sàng,
 *     đảm bảo method được gọi THÔNG QUA proxy → @Transactional hoạt động đúng.
 *
 * FIX #2: Ủy quyền xử lý từng invoice cho OverdueInvoiceProcessor.
 *   - Mỗi invoice chạy trong transaction REQUIRES_NEW độc lập.
 *   - 1 invoice lỗi chỉ rollback invoice đó, không làm hỏng cả batch
 *     (tránh "poison transaction" / UnexpectedRollbackException).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TuitionScheduler {

    private final TuitionService tuitionService;
    private final TuitionInvoiceRepository invoiceRepository;
    private final OverdueInvoiceProcessor overdueProcessor;

    // ── Startup ──────────────────────────────────────────────────────

    /**
     * FIX #1: ApplicationReadyEvent thay cho @PostConstruct.
     *
     * @PostConstruct lý do KHÔNG dùng:
     *   - Được Spring gọi trực tiếp trên raw bean instance.
     *   - Mọi this.method() đều bypass CGLIB proxy → @Transactional bị bỏ qua.
     *   - Hậu quả: invoiceRepository.save() chạy auto-commit riêng lẻ,
     *     không có atomicity, không rollback khi lỗi.
     *
     * ApplicationReadyEvent:
     *   - Được publish SAU khi toàn bộ ApplicationContext (kể cả proxy) đã sẵn sàng.
     *   - Method được gọi thông qua EventListener infrastructure → proxy hoạt động đúng.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        log.info("🔄 [Startup] Kiểm tra và đồng bộ hóa đơn quá hạn...");
        markOverdueInvoices();
    }

    // ── Scheduled Jobs ───────────────────────────────────────────────

    /**
     * Chạy lúc 00:01 ngày mùng 1 hàng tháng.
     * Tạo hóa đơn học phí cho tháng liền trước.
     * TuitionService.generateMonthlyInvoices() đã @Transactional, không cần thêm ở đây.
     */
    @Scheduled(cron = "0 1 0 1 * ?")
    public void generateTuitionForPreviousMonth() {
        log.info("🚀 Tự động tạo hóa đơn học phí cho tháng trước...");
        try {
            String previousMonth = LocalDate.now()
                    .minusMonths(1)
                    .format(DateTimeFormatter.ofPattern("MM/yyyy"));

            log.info("Bắt đầu sinh hóa đơn cho tháng: {}", previousMonth);
            var results = tuitionService.generateMonthlyInvoices(previousMonth);
            log.info("✅ Hoàn tất sinh hóa đơn. Tổng: {} hóa đơn đã tạo.", results.size());

        } catch (Exception e) {
            log.error("❌ Lỗi khi tự động tạo hóa đơn: {}", e.getMessage(), e);
        }
    }

    /**
     * Chạy lúc 00:30 mỗi ngày.
     * Tìm tất cả invoice có status=pending và dueDate < hôm nay,
     * ủy quyền xử lý từng invoice cho OverdueInvoiceProcessor.
     *
     * FIX #2: Không còn @Transactional trên method này.
     *   - TRƯỚC (bug): 1 transaction bao trọn N invoices.
     *     Nếu invoice thứ K lỗi → DataAccessException → Spring đánh dấu
     *     TX = ROLLBACK_ONLY → catch() nuốt exception nhưng TX đã bị poison →
     *     khi method return, Spring throw UnexpectedRollbackException →
     *     0/N invoices được commit.
     *   - SAU (fix): Mỗi invoice có TX REQUIRES_NEW riêng trong OverdueInvoiceProcessor.
     *     Invoice K lỗi chỉ rollback invoice K, các invoice còn lại không bị ảnh hưởng.
     */
    @Scheduled(cron = "0 30 0 * * *")
    public void markOverdueInvoices() {
        LocalDate today = LocalDate.now();

        List<TuitionInvoice> expiredInvoices = invoiceRepository
                .findByStatusAndDueDateBefore(InvoiceStatus.pending, today);

        if (expiredInvoices.isEmpty()) {
            log.debug("✅ Không có hóa đơn nào quá hạn hôm nay ({}).", today);
            return;
        }

        log.warn("⚠️ Phát hiện {} hóa đơn quá hạn — bắt đầu xử lý...", expiredInvoices.size());

        int success = 0;
        int failed = 0;

        for (TuitionInvoice invoice : expiredInvoices) {
            try {
                // Bước 1: DB commit trong REQUIRES_NEW — nếu lỗi chỉ rollback invoice này
                TuitionInvoice saved = overdueProcessor.commitOverdueStatus(invoice);
                success++;

                // Bước 2: Gửi notification SAU KHI DB đã commit
                // Notification lỗi KHÔNG rollback DB — đây là behavior đúng
                try {
                    overdueProcessor.sendOverdueNotificationAfterCommit(saved);
                } catch (Exception notifEx) {
                    log.warn("⚠️ Gửi notification thất bại cho invoice {} (invoice vẫn được đánh dấu overdue): {}",
                            saved.getId(), notifEx.getMessage());
                }
            } catch (Exception e) {
                failed++;
                log.error("❌ Lỗi xử lý overdue cho invoice {}: {}", invoice.getId(), e.getMessage(), e);
            }
        }

        log.warn("⚠️ Hoàn tất đánh dấu overdue: thành công={}, thất bại={}.", success, failed);
    }

    // ── Public API (dùng bởi TuitionServiceImpl.confirm()) ───────────

    /**
     * Đồng bộ Student.tuitionStatus sau khi admin confirm payment.
     * Delegate sang OverdueInvoiceProcessor để tái sử dụng logic.
     */
    public void syncStudentTuitionStatus(Student student) {
        overdueProcessor.syncStudentTuitionStatus(student);
    }
}
