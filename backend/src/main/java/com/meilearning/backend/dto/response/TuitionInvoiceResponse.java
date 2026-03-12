package com.meilearning.backend.dto.response;

import lombok.*;
import java.time.Instant;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TuitionInvoiceResponse {
    private Long id;

    // Student info
    private Long studentId;
    private String studentName;

    // Class info
    private Long classId;
    private String className;
    private String subjectName;

    // Invoice
    private String month;
    private Integer billableSessions;
    private Long pricePerSession;
    private Long totalAmount;
    private Long discountAmount;
    private String discountReason;
    private String dueDate;
    private String status;          // pending, reviewing, paid, overdue
    private String paidDate;
    private String paymentMethod;
    private String paymentProofUrl;

    private Instant createdAt;
    private Instant updatedAt;
}
