package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
import com.meilearning.backend.entity.AttendanceRecord;
import com.meilearning.backend.entity.TuitionInvoice;

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
import com.meilearning.backend.service.NotificationDispatcher;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.util.SpecHelper;
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
    private final NotificationDispatcher notificationDispatcher;

    // ── Breakdown record ─────────────────────────────────────────────

    /**
     * Kết quả phân tích attendance cho tính học phí.
     */
    private record SessionBreakdown(
            int total, int present, int late, int absentUnexcused, int absentExcused, int billable
    ) {}

    // ── Create Invoice ───────────────────────────────────────────────

    @Override
    public TuitionInvoiceResponse create(CreateTuitionRequest request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên: " + request.getStudentId()));

        ClassEntity classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp: " + request.getClassId()));

        // Tính billable sessions + breakdown
        SessionBreakdown breakdown = calculateSessionBreakdown(student.getId(), classEntity.getId(), request.getMonth());

        long pricePerSession = classEntity.getPricePerSession();
        long totalAmount = breakdown.billable() * pricePerSession;
        long discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : 0L;

        TuitionInvoice invoice = TuitionInvoice.builder()
                .student(student)
                .classEntity(classEntity)
                .month(request.getMonth())
                .billableSessions(breakdown.billable())
                .totalSessions(breakdown.total())
                .presentSessions(breakdown.present())
                .lateSessions(breakdown.late())
                .absentUnexcusedSessions(breakdown.absentUnexcused())
                .absentExcusedSessions(breakdown.absentExcused())
                .pricePerSession(pricePerSession)
                .totalAmount(totalAmount)
                .discountAmount(discount)
                .discountReason(request.getDiscountReason())
                .dueDate(calculateDueDate(request.getMonth()))
                .build();

        invoice = invoiceRepository.save(invoice);

        // Notify student: hóa đơn mới
        if (student.getUser() != null) {
            notificationDispatcher.notifyWithEmail(
                    student.getUser(),
                    "tuition",
                    "Hóa đơn học phí tháng " + request.getMonth(),
                    "Hóa đơn học phí lớp " + classEntity.getName()
                            + " tháng " + request.getMonth()
                            + " số tiền: " + totalAmount + "đ. Hạn thanh toán: " + invoice.getDueDate() + "."
            );
        }

        return tuitionMapper.toResponse(invoice);
    }

    // ── Auto-generate ────────────────────────────────────────────────

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

            SessionBreakdown breakdown = calculateSessionBreakdown(studentId, classId, month);

            if (breakdown.billable() == 0) continue;

            ClassEntity classEntity = enrollment.getClassEntity();
            long pricePerSession = classEntity.getPricePerSession();

            TuitionInvoice invoice = TuitionInvoice.builder()
                    .student(enrollment.getStudent())
                    .classEntity(classEntity)
                    .month(month)
                    .billableSessions(breakdown.billable())
                    .totalSessions(breakdown.total())
                    .presentSessions(breakdown.present())
                    .lateSessions(breakdown.late())
                    .absentUnexcusedSessions(breakdown.absentUnexcused())
                    .absentExcusedSessions(breakdown.absentExcused())
                    .pricePerSession(pricePerSession)
                    .totalAmount((long) breakdown.billable() * pricePerSession)
                    .dueDate(calculateDueDate(month))
                    .build();

            invoice = invoiceRepository.save(invoice);
            results.add(tuitionMapper.toResponse(invoice));
        }

        log.info("Generated {} invoices for month {}", results.size(), month);
        return results;
    }

    // ── Query ────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TuitionInvoiceResponse> getAll(String status, String month, Long studentId,
                                                        int page, int limit) {
        if (page < 1) page = 1;
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Specification<TuitionInvoice> spec = SpecHelper.empty();
        if (studentId != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("student").get("id"), studentId));
        }
        if (month != null && !month.isBlank()) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("month"), month));
        }
        if (status != null && !status.isBlank()) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), InvoiceStatus.valueOf(status)));
        }
        Page<TuitionInvoice> result = invoiceRepository.findAll(spec, pageable);
        return PageResponse.<TuitionInvoiceResponse>builder()
                .data(result.getContent().stream().map(tuitionMapper::toResponse).toList())
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(result.getTotalPages())
                .build();
    }

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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn: " + id));
        return tuitionMapper.toResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TuitionInvoiceResponse> getOverdue() {
        return invoiceRepository.findByStatus(InvoiceStatus.overdue).stream()
                .map(tuitionMapper::toResponse).toList();
    }

    // ── Payment Flow ─────────────────────────────────────────────────

    @Override
    public TuitionInvoiceResponse pay(Long id, PayTuitionRequest request) {
        TuitionInvoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn: " + id));

        if (invoice.getStatus() != InvoiceStatus.pending
                && invoice.getStatus() != InvoiceStatus.overdue) {
            throw new BusinessException("Chỉ có thể thanh toán hóa đơn pending hoặc overdue.");
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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn: " + id));

        if (invoice.getStatus() != InvoiceStatus.reviewing) {
            throw new BusinessException("Chỉ xác nhận hóa đơn đang ở trạng thái reviewing.");
        }

        invoice.setStatus(InvoiceStatus.paid);
        invoice.setPaidDate(LocalDate.now());
        invoice = invoiceRepository.save(invoice);

        // Notify student: payment confirmed
        if (invoice.getStudent() != null && invoice.getStudent().getUser() != null) {
            notificationDispatcher.notifyInApp(
                    invoice.getStudent().getUser(),
                    "tuition",
                    "Thanh toán đã xác nhận",
                    "Thanh toán học phí tháng " + invoice.getMonth()
                            + " lớp " + invoice.getClassEntity().getName() + " đã được xác nhận."
            );
        }
        return tuitionMapper.toResponse(invoice);
    }

    @Override
    public TuitionInvoiceResponse reject(Long id) {
        TuitionInvoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn: " + id));

        if (invoice.getStatus() != InvoiceStatus.reviewing) {
            throw new BusinessException("Chỉ từ chối hóa đơn đang reviewing.");
        }

        invoice.setStatus(InvoiceStatus.pending);
        invoice.setPaymentMethod(null);
        invoice.setPaymentProofUrl(null);
        invoice = invoiceRepository.save(invoice);

        // Notify student: payment rejected
        if (invoice.getStudent() != null && invoice.getStudent().getUser() != null) {
            notificationDispatcher.notifyWithEmail(
                    invoice.getStudent().getUser(),
                    "tuition",
                    "Thanh toán bị từ chối",
                    "Thanh toán học phí tháng " + invoice.getMonth()
                            + " lớp " + invoice.getClassEntity().getName()
                            + " bị từ chối. Vui lòng liên hệ admin để biết thêm chi tiết."
            );
        }
        return tuitionMapper.toResponse(invoice);
    }

    // ── Stats ────────────────────────────────────────────────────────

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

    // ── Helpers ──────────────────────────────────────────────────────

    /**
     * Tính breakdown attendance cho 1 student trong 1 lớp, 1 tháng.
     * Billable = PRESENT + ABSENT + LATE (không tính ABSENT_EXCUSED)
     */
    private SessionBreakdown calculateSessionBreakdown(Long studentId, Long classId, String monthStr) {
        // Parse month "MM/YYYY" -> date range
        String[] parts = monthStr.split("/");
        int monthValue = Integer.parseInt(parts[0]);
        int year = Integer.parseInt(parts[1]);
        YearMonth ym = YearMonth.of(year, monthValue);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        // Lấy sessions trong tháng (chỉ count)
        List<ClassSession> sessions = sessionRepository
                .findByClassEntityIdAndDateBetween(classId, start, end);

        int total = sessions.size();
        int present = 0;
        int late = 0;
        int absentUnexcused = 0;
        int absentExcused = 0;

        // Single batch query thay vì N+1 per session
        List<AttendanceRecord> allRecords = attendanceRepository
                .findByStudentAndClassAndDateRange(studentId, classId, start, end);

        // Index by sessionId để tra cứu nhanh
        java.util.Map<Long, AttendanceRecord> recordMap = new java.util.HashMap<>();
        for (AttendanceRecord r : allRecords) {
            recordMap.put(r.getSession().getId(), r);
        }

        for (ClassSession session : sessions) {
            AttendanceRecord record = recordMap.get(session.getId());
            if (record != null) {
                switch (record.getStatus()) {
                    case present -> present++;
                    case late -> late++;
                    case absent -> absentUnexcused++;
                    case absent_excused -> absentExcused++;
                }
            }
        }

        int billable = present + absentUnexcused + late;
        return new SessionBreakdown(total, present, late, absentUnexcused, absentExcused, billable);
    }

    /**
     * Due date = ngày 15 tháng sau
     */
    private LocalDate calculateDueDate(String monthStr) {
        String[] parts = monthStr.split("/");
        int monthValue = Integer.parseInt(parts[0]);
        int year = Integer.parseInt(parts[1]);
        YearMonth ym = YearMonth.of(year, monthValue);
        return ym.plusMonths(1).atDay(com.meilearning.backend.util.BusinessConstants.TUITION_DUE_DAY);
    }

    // ── Reminder Methods ─────────────────────────────────────────────

    @Override
    public java.util.Map<String, Integer> remindAll() {
        List<TuitionInvoice> unpaid = invoiceRepository.findByStatusIn(
                List.of(InvoiceStatus.pending, InvoiceStatus.overdue)
        );

        int sent = 0;
        int failed = 0;

        for (TuitionInvoice invoice : unpaid) {
            try {
                sendReminder(invoice);
                sent++;
            } catch (Exception e) {
                log.error("❌ Reminder failed for invoice {}: {}", invoice.getId(), e.getMessage());
                failed++;
            }
        }

        log.info("📢 Remind all completed: sent={}, failed={}", sent, failed);
        return java.util.Map.of("sent", sent, "failed", failed);
    }

    @Override
    public void remind(Long invoiceId) {
        TuitionInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại: " + invoiceId));

        if (invoice.getStatus() != InvoiceStatus.pending && invoice.getStatus() != InvoiceStatus.overdue) {
            throw new BusinessException("Chỉ có thể nhắc nợ hóa đơn chưa thanh toán hoặc quá hạn");
        }

        sendReminder(invoice);
    }

    private void sendReminder(TuitionInvoice invoice) {
        Student student = invoice.getStudent();
        if (student == null || student.getUser() == null) {
            log.warn("⚠️ Invoice {} has no linked student/user — skipping reminder", invoice.getId());
            return;
        }

        String className = invoice.getClassEntity() != null ? invoice.getClassEntity().getName() : "N/A";
        String title = "Nhắc nợ học phí tháng " + invoice.getMonth();
        String content = String.format(
                "Học viên %s có hóa đơn học phí lớp %s tháng %s chưa thanh toán. "
                        + "Số tiền: %,.0fđ. Hạn thanh toán: %s. Vui lòng thanh toán sớm.",
                student.getUser().getName(),
                className,
                invoice.getMonth(),
                invoice.getTotalAmount(),
                invoice.getDueDate() != null ? invoice.getDueDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A"
        );

        // notifyUrgent → In-App + Email + SMS (parentPhone) + Zalo ZNS
        notificationDispatcher.notifyUrgent(student.getUser(), "tuition_reminder", title, content);
    }
}
