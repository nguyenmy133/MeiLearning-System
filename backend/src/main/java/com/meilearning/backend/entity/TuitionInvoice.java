package com.meilearning.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.meilearning.backend.entity.enums.InvoiceStatus;
import java.time.LocalDate;

/**
 * Entity: Hóa đơn học phí.
 * price_per_session lưu snapshot giá tại thời điểm tạo hóa đơn
 * để không bị ảnh hưởng khi giá lớp thay đổi.
 */
@Entity
@Table(name = "tuition_invoices", indexes = {
        @Index(name = "idx_tuition_student", columnList = "student_id"),
        @Index(name = "idx_tuition_month", columnList = "month"),
        @Index(name = "idx_tuition_status", columnList = "status")
})

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TuitionInvoice extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    /** Tháng hóa đơn: "MM/YYYY" */

    @Column(nullable = false, length = 7)
    private String month;

    @Column(name = "billable_sessions")
    @Builder.Default
    private Integer billableSessions = 0;

    @Column(name = "total_sessions")
    @Builder.Default
    private Integer totalSessions = 0;

    @Column(name = "present_sessions")
    @Builder.Default
    private Integer presentSessions = 0;

    @Column(name = "absent_excused_sessions")
    @Builder.Default
    private Integer absentExcusedSessions = 0;

    @Column(name = "absent_unexcused_sessions")
    @Builder.Default
    private Integer absentUnexcusedSessions = 0;

    @Column(name = "late_sessions")
    @Builder.Default
    private Integer lateSessions = 0;

    /** Snapshot giá/buổi tại thá»i điểm tạo hóa đơn */

    @Column(name = "price_per_session", nullable = false)
    private Long pricePerSession;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.pending;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_proof_url", length = 500)
    private String paymentProofUrl;

}
