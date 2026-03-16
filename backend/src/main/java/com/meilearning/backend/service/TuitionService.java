package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.CreateTuitionRequest;
import com.meilearning.backend.dto.request.PayTuitionRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.TuitionInvoiceResponse;
import com.meilearning.backend.dto.response.TuitionStatsResponse;
import java.util.List;

public interface TuitionService {

    TuitionInvoiceResponse create(CreateTuitionRequest request);

    List<TuitionInvoiceResponse> generateMonthlyInvoices(String month);

    /** Paginated */
    PageResponse<TuitionInvoiceResponse> getAll(String status, String month, Long studentId, int page, int limit);

    /** Legacy — trả full list */
    List<TuitionInvoiceResponse> getAll(String status, String month, Long studentId);

    /** Lấy hóa đơn theo student */

    List<TuitionInvoiceResponse> getByStudent(Long studentId);

    /** Lấy chi tiết 1 hóa đơn */

    TuitionInvoiceResponse getById(Long id);

    /** Student nộp chứng từ thanh toán */

    TuitionInvoiceResponse pay(Long id, PayTuitionRequest request);

    /** Admin xác nhận thanh toán */

    TuitionInvoiceResponse confirm(Long id);

    /** Admin từ chối thanh toán (Ä‘Æ°a lại pending) */

    TuitionInvoiceResponse reject(Long id);

    /** Lấy danh sách quá háº¡n */

    List<TuitionInvoiceResponse> getOverdue();

    /** Thống kª */

    TuitionStatsResponse getStats(String month);

}
