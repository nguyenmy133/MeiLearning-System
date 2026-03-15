package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.CreateTuitionRequest;
import com.meilearning.backend.dto.request.PayTuitionRequest;
import com.meilearning.backend.dto.response.TuitionInvoiceResponse;
import com.meilearning.backend.dto.response.TuitionStatsResponse;
import java.util.List;

public interface TuitionService {

    /** Tạo h³a đơn thủ công (admin) */

    TuitionInvoiceResponse create(CreateTuitionRequest request);

    /** Tự động generate h³a đơn cho tháng hiện tại */

    List<TuitionInvoiceResponse> generateMonthlyInvoices(String month);

    /** Lấy tất cả h³a đơn (admin) - filter theo status, month */

    List<TuitionInvoiceResponse> getAll(String status, String month, Long studentId);

    /** Lấy h³a đơn theo student */

    List<TuitionInvoiceResponse> getByStudent(Long studentId);

    /** Lấy chi tiết 1 h³a đơn */

    TuitionInvoiceResponse getById(Long id);

    /** Student nộp chá»©ng từ thanh toán */

    TuitionInvoiceResponse pay(Long id, PayTuitionRequest request);

    /** Admin xác nháº­n thanh toán */

    TuitionInvoiceResponse confirm(Long id);

    /** Admin từ chối thanh toán (Ä‘Æ°a lại pending) */

    TuitionInvoiceResponse reject(Long id);

    /** Lấy danh sách quá háº¡n */

    List<TuitionInvoiceResponse> getOverdue();

    /** Thống kª */

    TuitionStatsResponse getStats(String month);

}
