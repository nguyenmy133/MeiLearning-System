package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.CreateTuitionRequest;
import com.meilearning.backend.dto.request.PayTuitionRequest;
import com.meilearning.backend.dto.response.TuitionInvoiceResponse;
import com.meilearning.backend.dto.response.TuitionStatsResponse;

import java.util.List;

public interface TuitionService {

    /** Táº¡o hĂ³a Ä‘Æ¡n thá»§ cĂ´ng (admin) */
    TuitionInvoiceResponse create(CreateTuitionRequest request);

    /** Tá»± Ä‘á»™ng generate hĂ³a Ä‘Æ¡n cho thĂ¡ng hiá»‡n táº¡i */
    List<TuitionInvoiceResponse> generateMonthlyInvoices(String month);

    /** Láº¥y táº¥t cáº£ hĂ³a Ä‘Æ¡n (admin) - filter theo status, month */
    List<TuitionInvoiceResponse> getAll(String status, String month, Long studentId);

    /** Láº¥y hĂ³a Ä‘Æ¡n theo student */
    List<TuitionInvoiceResponse> getByStudent(Long studentId);

    /** Láº¥y chi tiáº¿t 1 hĂ³a Ä‘Æ¡n */
    TuitionInvoiceResponse getById(Long id);

    /** Student ná»™p chá»©ng tá»« thanh toĂ¡n */
    TuitionInvoiceResponse pay(Long id, PayTuitionRequest request);

    /** Admin xĂ¡c nháº­n thanh toĂ¡n */
    TuitionInvoiceResponse confirm(Long id);

    /** Admin tá»« chá»‘i thanh toĂ¡n (Ä‘Æ°a láº¡i pending) */
    TuitionInvoiceResponse reject(Long id);

    /** Láº¥y danh sĂ¡ch quĂ¡ háº¡n */
    List<TuitionInvoiceResponse> getOverdue();

    /** Thá»‘ng kĂª */
    TuitionStatsResponse getStats(String month);
}
