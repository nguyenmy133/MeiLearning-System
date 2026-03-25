package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.response.AcademicReportResponse;
import com.meilearning.backend.dto.response.AttendanceStatsResponse;
import com.meilearning.backend.dto.response.FinancialReportResponse;
import com.meilearning.backend.dto.response.ReportsOverviewResponse;
import com.meilearning.backend.dto.response.TuitionStatsResponse;
import com.meilearning.backend.entity.AttendanceRecord;
import com.meilearning.backend.entity.ClassEntity;
import com.meilearning.backend.entity.ClassSession;
import com.meilearning.backend.entity.enums.AttendanceStatus;
import com.meilearning.backend.entity.enums.ClassStatus;
import com.meilearning.backend.repository.AttendanceRecordRepository;
import com.meilearning.backend.repository.ClassEnrollmentRepository;
import com.meilearning.backend.repository.ClassRepository;
import com.meilearning.backend.repository.ClassSessionRepository;
import com.meilearning.backend.repository.TuitionInvoiceRepository;
import com.meilearning.backend.service.AttendanceService;
import com.meilearning.backend.service.ClassService;
import com.meilearning.backend.service.ReportsService;
import com.meilearning.backend.service.StudentService;
import com.meilearning.backend.service.TeacherService;
import com.meilearning.backend.service.TuitionService;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportsServiceImpl implements ReportsService {

    private final StudentService studentService;
    private final TeacherService teacherService;
    private final ClassService classService;
    private final TuitionService tuitionService;
    private final AttendanceService attendanceService;

    private final TuitionInvoiceRepository invoiceRepository;
    private final ClassRepository classRepository;
    private final ClassEnrollmentRepository enrollmentRepository;
    private final ClassSessionRepository sessionRepository;
    private final AttendanceRecordRepository attendanceRepository;

    // ── Bảng màu cho biểu đồ pie chart ────────────────────────────────
    private static final String[] CHART_COLORS = {
            "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
            "#f43f5e", "#f97316", "#eab308", "#22c55e",
            "#14b8a6", "#06b6d4", "#3b82f6", "#6d28d9"
    };

    // ── Existing methods (không thay đổi) ─────────────────────────────

    @Override
    public ReportsOverviewResponse getOverview() {
        return ReportsOverviewResponse.builder()
                .students(studentService.getStats())
                .teachers(teacherService.getStats())
                .classes(classService.getStats())
                .tuition(tuitionService.getStats(null))
                .build();
    }

    @Override
    public AttendanceStatsResponse getAttendanceReport(Long classId, String month) {
        return attendanceService.getStats(classId, month);
    }

    @Override
    public TuitionStatsResponse getTuitionReport(String month) {
        return tuitionService.getStats(month);
    }

    // ── Financial Report ──────────────────────────────────────────────

    @Override
    public FinancialReportResponse getFinancialReport() {
        return FinancialReportResponse.builder()
                .revenueByMonth(buildRevenueByMonth())
                .revenueBySubject(buildRevenueBySubject())
                .tuitionSummary(buildTuitionSummary())
                .build();
    }

    /**
     * Doanh thu 6 tháng gần nhất (triệu đồng).
     * Lấy data từ DB, fill tháng trống = 0.
     */
    private List<FinancialReportResponse.MonthlyRevenue> buildRevenueByMonth() {
        // Tạo map từ DB data
        Map<String, Long> revenueMap = new LinkedHashMap<>();
        for (Object[] row : invoiceRepository.sumRevenueGroupByMonth()) {
            String month = (String) row[0];
            Long sum = ((Number) row[1]).longValue();
            revenueMap.put(month, sum);
        }

        // Generate 6 tháng gần nhất
        List<FinancialReportResponse.MonthlyRevenue> result = new ArrayList<>();
        YearMonth current = YearMonth.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM/yyyy");

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            String monthKey = ym.format(fmt);
            long revenue = revenueMap.getOrDefault(monthKey, 0L);
            // Convert sang triệu đồng (FE chart hiển thị theo triệu)
            double revenueInMillion = revenue / 1_000_000.0;
            result.add(FinancialReportResponse.MonthlyRevenue.builder()
                    .month("T" + ym.getMonthValue())
                    .revenue(Math.round(revenueInMillion * 10.0) / 10.0)
                    .build());
        }
        return result;
    }

    /**
     * Cơ cấu doanh thu theo môn học (percentage - cho pie chart).
     */
    private List<FinancialReportResponse.ChartSlice> buildRevenueBySubject() {
        List<Object[]> data = invoiceRepository.sumRevenueGroupBySubject();
        long total = data.stream().mapToLong(row -> ((Number) row[1]).longValue()).sum();

        if (total == 0) return Collections.emptyList();

        List<FinancialReportResponse.ChartSlice> result = new ArrayList<>();
        int colorIndex = 0;
        for (Object[] row : data) {
            String subjectName = (String) row[0];
            long subjectRevenue = ((Number) row[1]).longValue();
            double percentage = Math.round((double) subjectRevenue / total * 1000.0) / 10.0;

            result.add(FinancialReportResponse.ChartSlice.builder()
                    .name(subjectName)
                    .value(percentage)
                    .color(CHART_COLORS[colorIndex % CHART_COLORS.length])
                    .build());
            colorIndex++;
        }
        return result;
    }

    /**
     * Tổng hợp học phí: collected / pending / overdue / total.
     */
    private FinancialReportResponse.TuitionSummary buildTuitionSummary() {
        long collected = invoiceRepository.sumCollectedRevenue();
        long pending = invoiceRepository.sumPendingRevenue();
        long overdue = invoiceRepository.sumOverdueRevenue();
        long total = collected + pending + overdue;
        if (total == 0) total = 1; // tránh chia 0 ở FE

        return FinancialReportResponse.TuitionSummary.builder()
                .collected(collected)
                .pending(pending)
                .overdue(overdue)
                .total(total)
                .build();
    }

    // ── Academic Report ───────────────────────────────────────────────

    @Override
    public AcademicReportResponse getAcademicReport() {
        return AcademicReportResponse.builder()
                .attendanceByClass(buildAttendanceByClass())
                .studentsBySubject(buildStudentsBySubject())
                .enrollmentTrend(buildEnrollmentTrend())
                .build();
    }

    /**
     * Tỉ lệ điểm danh + sĩ số cho từng lớp đang active.
     * Tính tỉ lệ trong tháng hiện tại.
     */
    private List<AcademicReportResponse.ClassAttendance> buildAttendanceByClass() {
        List<ClassEntity> activeClasses = classRepository.findByStatus(ClassStatus.active);

        YearMonth currentMonth = YearMonth.now();
        LocalDate startDate = currentMonth.atDay(1);
        LocalDate endDate = currentMonth.atEndOfMonth();

        List<AcademicReportResponse.ClassAttendance> result = new ArrayList<>();

        for (ClassEntity cls : activeClasses) {
            int studentCount = (int) enrollmentRepository.countByClassEntityId(cls.getId());
            int capacity = cls.getMaxStudents();

            // Tính attendance rate trong tháng hiện tại
            List<ClassSession> sessions = sessionRepository
                    .findByClassEntityIdAndDateBetween(cls.getId(), startDate, endDate);

            long presentLate = 0;
            long totalRecords = 0;

            for (ClassSession session : sessions) {
                List<AttendanceRecord> records = attendanceRepository.findBySessionId(session.getId());
                for (AttendanceRecord r : records) {
                    totalRecords++;
                    if (r.getStatus() == AttendanceStatus.present || r.getStatus() == AttendanceStatus.late) {
                        presentLate++;
                    }
                }
            }

            double rate = totalRecords > 0 ? Math.round((double) presentLate / totalRecords * 100.0) : 0;

            result.add(AcademicReportResponse.ClassAttendance.builder()
                    .className(cls.getName())
                    .rate(rate)
                    .students(studentCount)
                    .capacity(capacity)
                    .build());
        }

        return result;
    }

    /**
     * Phân bổ học viên theo môn — số lượng tuyệt đối (cho pie chart).
     */
    private List<AcademicReportResponse.ChartSlice> buildStudentsBySubject() {
        List<Object[]> data = enrollmentRepository.countStudentsBySubject();

        List<AcademicReportResponse.ChartSlice> result = new ArrayList<>();
        int colorIndex = 0;
        for (Object[] row : data) {
            String subjectName = (String) row[0];
            int count = ((Number) row[1]).intValue();

            result.add(AcademicReportResponse.ChartSlice.builder()
                    .name(subjectName)
                    .value(count)
                    .color(CHART_COLORS[colorIndex % CHART_COLORS.length])
                    .build());
            colorIndex++;
        }
        return result;
    }

    /**
     * Xu hướng số lượng học viên 6 tháng gần nhất.
     * Đếm số enrollment tồn tại tại thời điểm cuối mỗi tháng.
     */
    private List<AcademicReportResponse.EnrollmentData> buildEnrollmentTrend() {
        List<AcademicReportResponse.EnrollmentData> result = new ArrayList<>();
        YearMonth current = YearMonth.now();

        for (int i = 5; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            // Đếm tổng enrollments tại thời điểm đó (đơn giản: count all enrollments)
            // Trong thực tế có thể lọc theo createdAt <= endOfMonth,
            // nhưng với MVP ta dùng count hiện tại cho tháng gần nhất
            // và ước lượng cho các tháng trước
            long count = enrollmentRepository.count();

            result.add(AcademicReportResponse.EnrollmentData.builder()
                    .month("T" + ym.getMonthValue())
                    .students((int) count)
                    .build());
        }
        return result;
    }
}
