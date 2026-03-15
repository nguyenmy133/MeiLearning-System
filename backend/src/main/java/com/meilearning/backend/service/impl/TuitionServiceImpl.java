package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.request.CreateTuitionRequest;
import com.meilearning.backend.dto.request.PayTuitionRequest;
import com.meilearning.backend.dto.response.TuitionInvoiceResponse;
import com.meilearning.backend.dto.response.TuitionStatsResponse;
import com.meilearning.backend.entity.ClassEntity;
import com.meilearning.backend.entity.ClassEnrollment;
import com.meilearning.backend.entity.ClassSession;
import com.meilearning.backend.entity.Student;
import com.meilearning.backend.entity.TuitionInvoice;
import com.meilearning.backend.entity.enums.AttendanceStatus;
import com.meilearning.backend.entity.enums.InvoiceStatus;
import com.meilearning.backend.exception.BusinessException;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.mapper.TuitionMapper;
import com.meilearning.backend.repository.AttendanceRecordRepository;
import com.meilearning.backend.repository.ClassEnrollmentRepository;
import com.meilearning.backend.repository.ClassRepository;
import com.meilearning.backend.repository.ClassSessionRepository;
import com.meilearning.backend.repository.StudentRepository;
import com.meilearning.backend.repository.TuitionInvoiceRepository;
import com.meilearning.backend.service.TuitionService;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TuitionServiceImpl implements TuitionService {

    private final TuitionInvoiceRepository invoiceRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final ClassSessionRepository sessionRepository;
    private final ClassEnrollmentRepository enrollmentRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final TuitionMapper tuitionMapper;

    // â”€â”€ Create Invoice â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Override
    public TuitionInvoiceResponse create(CreateTuitionRequest request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên: " + request.getStudentId()));

        ClassEntity classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp: " + request.getClassId()));

        // T­nh billable sessions

        int billable = calculateBillableSessions(student.getId(), classEntity.getId(), request.getMonth());

        long pricePerSession = classEntity.getPricePerSession();

        long totalAmount = billable * pricePerSession;

        long discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : 0L;

        TuitionInvoice invoice = TuitionInvoice.builder()
                .student(student)
                .classEntity(classEntity)
                .month(request.getMonth())
                .billableSessions(billable)
                .pricePerSession(pricePerSession)
                .totalAmount(totalAmount)
                .discountAmount(discount)
                .discountReason(request.getDiscountReason())
                .dueDate(calculateDueDate(request.getMonth()))
                .build();

        invoice = invoiceRepository.save(invoice);

        return tuitionMapper.toResponse(invoice);

    }

    // â”€â”€ Auto-generate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Override
    public List<TuitionInvoiceResponse> generateMonthlyInvoices(String month) {

        List<TuitionInvoiceResponse> results = new ArrayList<>();

        // Lấy tất cả enrollments active

        List<ClassEnrollment> enrollments = enrollmentRepository.findAll();

        for (ClassEnrollment enrollment : enrollments) {
            Long studentId = enrollment.getStudent().getId();

            Long classId = enrollment.getClassEntity().getId();

            // Skip nếu đã có invoice cho tháng này

            List<TuitionInvoice> existing = invoiceRepository

                    .findByStudentIdAndMonth(studentId, month);

            boolean alreadyExists = existing.stream()
                    .anyMatch(i -> i.getClassEntity().getId().equals(classId));

            if (alreadyExists) continue;
            int billable = calculateBillableSessions(studentId, classId, month);

            if (billable == 0) continue;
            ClassEntity classEntity = enrollment.getClassEntity();

            long pricePerSession = classEntity.getPricePerSession();

            TuitionInvoice invoice = TuitionInvoice.builder()
                    .student(enrollment.getStudent())
                    .classEntity(classEntity)
                    .month(month)
                    .billableSessions(billable)
                    .pricePerSession(pricePerSession)
                    .totalAmount((long) billable * pricePerSession)
                    .dueDate(calculateDueDate(month))
                    .build();

            invoice = invoiceRepository.save(invoice);

            results.add(tuitionMapper.toResponse(invoice));

        }

        log.info("Generated {} invoices for month {}", results.size(), month);

        return results;

    }

    // â”€â”€ Query â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Override
    @Transactional(readOnly = true)
    public List<TuitionInvoiceResponse> getAll(String status, String month, Long studentId) {

        List<TuitionInvoice> invoices;

        if (studentId != null) {
            invoices = invoiceRepository.findByStudentId(studentId);

        } else if (month != null) {
            invoices = invoiceRepository.findByMonth(month);

        } else if (status != null) {
            invoices = invoiceRepository.findByStatus(InvoiceStatus.valueOf(status));

        } else {
            invoices = invoiceRepository.findAll();

        }

        return invoices.stream().map(tuitionMapper::toResponse).toList();

    }

    @Override
    @Transactional(readOnly = true)
    public List<TuitionInvoiceResponse> getByStudent(Long studentId) {

        return invoiceRepository.findByStudentId(studentId).stream()
                .map(tuitionMapper::toResponse).toList();

    }

    @Override
    @Transactional(readOnly = true)
    public TuitionInvoiceResponse getById(Long id) {

        TuitionInvoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy h³a đơn: " + id));

        return tuitionMapper.toResponse(invoice);

    }

    @Override
    @Transactional(readOnly = true)
    public List<TuitionInvoiceResponse> getOverdue() {

        return invoiceRepository.findByStatus(InvoiceStatus.overdue).stream()
                .map(tuitionMapper::toResponse).toList();

    }

    // â”€â”€ Payment Flow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Override
    public TuitionInvoiceResponse pay(Long id, PayTuitionRequest request) {

        TuitionInvoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy h³a đơn: " + id));

        if (invoice.getStatus() != InvoiceStatus.pending
                && invoice.getStatus() != InvoiceStatus.overdue) {

            throw new BusinessException("Chá»‰ có thể thanh toán h³a đơn pending hoặc overdue.");

        }

        invoice.setStatus(InvoiceStatus.reviewing);
        invoice.setPaymentMethod(request.getPaymentMethod());
        invoice.setPaymentProofUrl(request.getPaymentProofUrl());

        invoice = invoiceRepository.save(invoice);

        return tuitionMapper.toResponse(invoice);

    }

    @Override
    public TuitionInvoiceResponse confirm(Long id) {

        TuitionInvoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy h³a đơn: " + id));

        if (invoice.getStatus() != InvoiceStatus.reviewing) {
            throw new BusinessException("Chá»‰ xác nháº­n h³a đơn Ä‘ang á»Ÿ tráº¡ng thái reviewing.");

        }

        invoice.setStatus(InvoiceStatus.paid);
        invoice.setPaidDate(LocalDate.now());

        invoice = invoiceRepository.save(invoice);

        return tuitionMapper.toResponse(invoice);

    }

    @Override
    public TuitionInvoiceResponse reject(Long id) {

        TuitionInvoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy h³a đơn: " + id));

        if (invoice.getStatus() != InvoiceStatus.reviewing) {
            throw new BusinessException("Chá»‰ từ chối h³a đơn Ä‘ang reviewing.");

        }

        invoice.setStatus(InvoiceStatus.pending);
        invoice.setPaymentMethod(null);
        invoice.setPaymentProofUrl(null);

        invoice = invoiceRepository.save(invoice);

        return tuitionMapper.toResponse(invoice);

    }

    // â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Override
    @Transactional(readOnly = true)
    public TuitionStatsResponse getStats(String month) {

        String currentMonth = month != null ? month

                : LocalDate.now().format(DateTimeFormatter.ofPattern("MM/yyyy"));

        return TuitionStatsResponse.builder()
                .totalInvoices(invoiceRepository.count())
                .pendingCount(invoiceRepository.countByStatus(InvoiceStatus.pending))
                .reviewingCount(invoiceRepository.countByStatus(InvoiceStatus.reviewing))
                .paidCount(invoiceRepository.countByStatus(InvoiceStatus.paid))
                .overdueCount(invoiceRepository.countByStatus(InvoiceStatus.overdue))
                .totalRevenue(invoiceRepository.sumTotalRevenue())
                .monthRevenue(invoiceRepository.sumRevenueByMonth(currentMonth))
                .build();

    }

    // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**

     * T­nh billable sessions = PRESENT + ABSENT + LATE (không t­nh ABSENT_EXCUSED)

     */

    private int calculateBillableSessions(Long studentId, Long classId, String monthStr) {

        // Parse month "MM/YYYY" â†’ date range

        String[] parts = monthStr.split("/");

        int monthValue = Integer.parseInt(parts[0]);

        int year = Integer.parseInt(parts[1]);

        YearMonth ym = YearMonth.of(year, monthValue);

        LocalDate start = ym.atDay(1);

        LocalDate end = ym.atEndOfMonth();

        // Lấy sessions trong tháng

        List<ClassSession> sessions = sessionRepository

                .findByClassEntityIdAndDateBetween(classId, start, end);

        int billable = 0;

        for (ClassSession session : sessions) {
            var record = attendanceRepository

                    .findBySessionIdAndStudentId(session.getId(), studentId);

            if (record.isPresent()) {
                AttendanceStatus status = record.get().getStatus();

                // Billable: present + absent (không ph©p) + late

                if (status == AttendanceStatus.present
                        || status == AttendanceStatus.absent

                        || status == AttendanceStatus.late) {

                    billable++;

                }

                // absent_excused â†’ không t­nh tiá»n

            }

        }

        return billable;

    }

    /**

     * Due date = ngày 15 tháng sau

     */

    private LocalDate calculateDueDate(String monthStr) {

        String[] parts = monthStr.split("/");

        int monthValue = Integer.parseInt(parts[0]);

        int year = Integer.parseInt(parts[1]);

        YearMonth ym = YearMonth.of(year, monthValue);

        return ym.plusMonths(1).atDay(15);

    }

}
