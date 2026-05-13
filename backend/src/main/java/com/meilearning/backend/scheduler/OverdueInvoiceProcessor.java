package com.meilearning.backend.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.entity.Student;
import com.meilearning.backend.entity.TuitionInvoice;
import com.meilearning.backend.entity.enums.InvoiceStatus;
import com.meilearning.backend.entity.enums.TuitionStatus;
import com.meilearning.backend.repository.StudentRepository;
import com.meilearning.backend.repository.TuitionInvoiceRepository;
import com.meilearning.backend.service.NotificationDispatcher;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Xử lý từng invoice quá hạn trong transaction ĐỘC LẬP (REQUIRES_NEW).
 *
 * Tách ra khỏi TuitionScheduler để giải quyết 2 vấn đề:
 * 1. Self-invocation: @Transactional trên TuitionScheduler bị bypass khi
 *    @PostConstruct gọi method trong cùng class.
 * 2. Poison transaction: 1 invoice lỗi không làm hỏng cả batch —
 *    mỗi invoice chạy trong TX riêng, lỗi thì chỉ rollback invoice đó.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OverdueInvoiceProcessor {

    private final TuitionInvoiceRepository invoiceRepository;
    private final StudentRepository studentRepository;
    private final NotificationDispatcher notificationDispatcher;

    /**
     * Bước 1/2 — Chỉ thực hiện DB writes trong transaction REQUIRES_NEW.
     *
     * Tách notification ra NGOÀI transaction để tránh:
     * - Notification gửi thành công nhưng DB rollback → student nhận thông báo sai.
     * - Notification lỗi (email/SMS timeout) → rollback invoice đã đánh dấu overdue đúng.
     * Nguyên tắc: side effects bên ngoài hệ thống chỉ thực hiện SAU KHI DB commit.
     *
     * @return invoice đã được persist với status=overdue (để caller gửi notification)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public TuitionInvoice commitOverdueStatus(TuitionInvoice invoice) {
        invoice.setStatus(InvoiceStatus.overdue);
        TuitionInvoice saved = invoiceRepository.save(invoice);

        syncStudentTuitionStatus(saved.getStudent());

        log.info("🔴 Invoice {} (student={}, tháng={}) → overdue (dueDate={})",
                saved.getId(),
                saved.getStudent() != null ? saved.getStudent().getId() : "N/A",
                saved.getMonth(),
                saved.getDueDate());

        return saved;
    }

    /**
     * Bước 2/2 — Gửi notification SAU KHI DB transaction đã commit.
     * Gọi từ TuitionScheduler sau khi commitOverdueStatus() thành công.
     */
    public void sendOverdueNotificationAfterCommit(TuitionInvoice invoice) {
        sendOverdueNotification(invoice);
    }

    /**
     * Cập nhật Student.tuitionStatus dựa trên trạng thái thực tế của các invoice.
     * Chạy trong transaction của processOverdueInvoice (REQUIRES_NEW).
     */
    public void syncStudentTuitionStatus(Student student) {
        if (student == null) return;

        boolean hasOverdue = invoiceRepository.existsByStudentIdAndStatusIn(
                student.getId(), List.of(InvoiceStatus.overdue));

        boolean hasPending = !hasOverdue && invoiceRepository.existsByStudentIdAndStatusIn(
                student.getId(), List.of(InvoiceStatus.pending));

        TuitionStatus newStatus;
        if (hasOverdue) {
            newStatus = TuitionStatus.overdue;
        } else if (hasPending) {
            newStatus = TuitionStatus.pending;
        } else {
            newStatus = TuitionStatus.paid;
        }

        if (student.getTuitionStatus() != newStatus) {
            student.setTuitionStatus(newStatus);
            studentRepository.save(student);
            log.debug("📋 Student {} tuitionStatus → {}", student.getId(), newStatus);
        }
    }

    private void sendOverdueNotification(TuitionInvoice invoice) {
        if (invoice.getStudent() == null || invoice.getStudent().getUser() == null) {
            log.warn("⚠️ Invoice {} không có student/user — bỏ qua notification.", invoice.getId());
            return;
        }

        String className = invoice.getClassEntity() != null
                ? invoice.getClassEntity().getName() : "N/A";

        String dueDateStr = invoice.getDueDate() != null
                ? invoice.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A";

        String title = "⚠️ Học phí quá hạn — tháng " + invoice.getMonth();
        String content = String.format(
                "Hóa đơn học phí lớp %s tháng %s đã quá hạn thanh toán (hạn: %s). "
                        + "Số tiền: %,dđ. Vui lòng thanh toán ngay để tránh bị khóa tài khoản.",
                className,
                invoice.getMonth(),
                dueDateStr,
                invoice.getTotalAmount()
        );

        notificationDispatcher.notifyUrgent(
                invoice.getStudent().getUser(),
                "tuition_overdue",
                title,
                content
        );
    }
}
