package meilearning.com.backend.service;

import meilearning.com.backend.dto.request.CreateTuitionRequest;
import meilearning.com.backend.dto.request.PayTuitionRequest;
import meilearning.com.backend.dto.response.TuitionInvoiceResponse;
import meilearning.com.backend.dto.response.TuitionStatsResponse;

import java.util.List;

public interface TuitionService {

    /** Tạo hóa đơn thủ công (admin) */
    TuitionInvoiceResponse create(CreateTuitionRequest request);

    /** Tự động generate hóa đơn cho tháng hiện tại */
    List<TuitionInvoiceResponse> generateMonthlyInvoices(String month);

    /** Lấy tất cả hóa đơn (admin) - filter theo status, month */
    List<TuitionInvoiceResponse> getAll(String status, String month, Long studentId);

    /** Lấy hóa đơn theo student */
    List<TuitionInvoiceResponse> getByStudent(Long studentId);

    /** Lấy chi tiết 1 hóa đơn */
    TuitionInvoiceResponse getById(Long id);

    /** Student nộp chứng từ thanh toán */
    TuitionInvoiceResponse pay(Long id, PayTuitionRequest request);

    /** Admin xác nhận thanh toán */
    TuitionInvoiceResponse confirm(Long id);

    /** Admin từ chối thanh toán (đưa lại pending) */
    TuitionInvoiceResponse reject(Long id);

    /** Lấy danh sách quá hạn */
    List<TuitionInvoiceResponse> getOverdue();

    /** Thống kê */
    TuitionStatsResponse getStats(String month);
}
