package com.meilearning.backend.mapper;

import org.springframework.stereotype.Component;
import com.meilearning.backend.dto.response.TuitionInvoiceResponse;
import com.meilearning.backend.entity.TuitionInvoice;
@Component
public class TuitionMapper {

    public TuitionInvoiceResponse toResponse(TuitionInvoice invoice) {
        return TuitionInvoiceResponse.builder()
                .id(invoice.getId())
                .studentId(invoice.getStudent().getId())
                .studentName(invoice.getStudent().getUser().getName())
                .classId(invoice.getClassEntity().getId())
                .className(invoice.getClassEntity().getName())
                .subjectName(invoice.getClassEntity().getSubject().getName())
                .month(invoice.getMonth())
                .billableSessions(invoice.getBillableSessions())
                .totalSessions(invoice.getTotalSessions())
                .presentSessions(invoice.getPresentSessions())
                .absentExcusedSessions(invoice.getAbsentExcusedSessions())
                .absentUnexcusedSessions(invoice.getAbsentUnexcusedSessions())
                .lateSessions(invoice.getLateSessions())
                .pricePerSession(invoice.getPricePerSession())
                .totalAmount(invoice.getTotalAmount())
                .dueDate(invoice.getDueDate() != null ? invoice.getDueDate().toString() : null)
                .status(invoice.getStatus().name())
                .paidDate(invoice.getPaidDate() != null ? invoice.getPaidDate().toString() : null)
                .paymentMethod(invoice.getPaymentMethod())
                .paymentProofUrl(invoice.getPaymentProofUrl())
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .build();
    }
}
