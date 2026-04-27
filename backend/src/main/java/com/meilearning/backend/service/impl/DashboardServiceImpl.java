package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.response.DashboardResponse;
import com.meilearning.backend.dto.response.DashboardResponse.*;
import com.meilearning.backend.entity.AttendanceRecord;
import com.meilearning.backend.entity.ClassSession;
import com.meilearning.backend.entity.TuitionInvoice;
import com.meilearning.backend.entity.enums.ClassStatus;
import com.meilearning.backend.entity.enums.InvoiceStatus;
import com.meilearning.backend.entity.enums.SessionStatus;
import com.meilearning.backend.repository.AttendanceRecordRepository;
import com.meilearning.backend.repository.ClassEnrollmentRepository;
import com.meilearning.backend.repository.ClassRepository;
import com.meilearning.backend.repository.ClassSessionRepository;
import com.meilearning.backend.repository.StudentRepository;
import com.meilearning.backend.repository.TeacherRepository;
import com.meilearning.backend.repository.TuitionInvoiceRepository;
import com.meilearning.backend.service.DashboardService;

import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ClassRepository classRepository;
    private final TuitionInvoiceRepository invoiceRepository;
    private final ClassSessionRepository sessionRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final ClassEnrollmentRepository enrollmentRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final String[] DAY_NAMES = {"CN", "T2", "T3", "T4", "T5", "T6", "T7"};

    @Override
    public DashboardResponse getDashboard() {
        return DashboardResponse.builder()
                .stats(buildStats())
                .revenueData(buildRevenueData())
                .todaySchedule(buildTodaySchedule())
                .todayAttendance(buildTodayAttendance())
                .alerts(buildAlerts())
                .overdueStudents(buildOverdueStudents())
                .build();
    }

    // ── 1. Stat Cards ─────────────────────────────────────────────────

    private List<StatItem> buildStats() {
        long totalStudents = studentRepository.count();
        long totalTeachers = teacherRepository.count();
        long activeClasses = classRepository.countByStatus(ClassStatus.active);

        // Doanh thu tháng hiện tại
        String currentMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("MM/yyyy"));
        long monthRevenue = invoiceRepository.sumRevenueByMonth(currentMonth);
        String revenueDisplay = formatCurrency(monthRevenue);

        return List.of(
                StatItem.builder()
                        .label("Tổng học viên").value(String.valueOf(totalStudents))
                        .change("").trend("up").build(),
                StatItem.builder()
                        .label("Giáo viên").value(String.valueOf(totalTeachers))
                        .change("").trend("up").build(),
                StatItem.builder()
                        .label("Lớp đang mở").value(String.valueOf(activeClasses))
                        .change("").trend("up").build(),
                StatItem.builder()
                        .label("Doanh thu tháng").value(revenueDisplay)
                        .change("").trend("up").build()
        );
    }

    // ── 2. Revenue 7 ngày ─────────────────────────────────────────────

    private List<DailyRevenue> buildRevenueData() {
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(6);

        // Query revenue grouped by paidDate
        Map<LocalDate, Long> revenueMap = new LinkedHashMap<>();
        for (Object[] row : invoiceRepository.sumRevenueByPaidDateBetween(weekAgo, today)) {
            LocalDate date = (LocalDate) row[0];
            long sum = ((Number) row[1]).longValue();
            revenueMap.put(date, sum);
        }

        List<DailyRevenue> result = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = weekAgo.plusDays(i);
            long revenue = revenueMap.getOrDefault(date, 0L);
            // dayOfWeek: 1=Monday..7=Sunday
            String dayName = DAY_NAMES[date.getDayOfWeek().getValue() % 7];

            result.add(DailyRevenue.builder()
                    .day(dayName)
                    .revenue(Math.round(revenue / 1_000_000.0 * 10.0) / 10.0) // triệu đồng
                    .build());
        }
        return result;
    }

    // ── 3. Today Schedule ─────────────────────────────────────────────

    private List<TodaySession> buildTodaySchedule() {
        java.time.ZoneId vnZone = java.time.ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDate today = LocalDate.now(vnZone);
        LocalTime now = LocalTime.now(vnZone);

        List<ClassSession> sessions = sessionRepository.findByDate(today);

        return sessions.stream()
                .filter(s -> s.getStatus() != SessionStatus.cancelled)
                .filter(s -> s.getClassEntity() != null && s.getClassEntity().getStatus() == ClassStatus.active)
                .sorted(Comparator.comparing(ClassSession::getStartTime))
                .map(s -> {
                    String time = s.getStartTime().format(TIME_FMT) + " - " + s.getEndTime().format(TIME_FMT);

                    String className = s.getClassEntity() != null ? s.getClassEntity().getName() : "";
                    String teacher = s.getClassEntity() != null && s.getClassEntity().getTeacher() != null
                            && s.getClassEntity().getTeacher().getUser() != null
                            ? s.getClassEntity().getTeacher().getUser().getName() : "";
                    String room = "";
                    if (s.getRoomOverride() != null) {
                        room = s.getRoomOverride().getName();
                    } else if (s.getClassEntity() != null && s.getClassEntity().getRoom() != null) {
                        room = s.getClassEntity().getRoom().getName();
                    }

                    int studentCount = s.getClassEntity() != null
                            ? (int) enrollmentRepository.countByClassEntityId(s.getClassEntity().getId())
                            : 0;

                    // Determine status
                    String status;
                    if (s.getStatus() == SessionStatus.completed) {
                        status = "completed";
                    } else if (s.getStartTime().isBefore(now) && s.getEndTime().isAfter(now)) {
                        status = "ongoing";
                    } else if (s.getStartTime().isAfter(now)) {
                        status = "upcoming";
                    } else {
                        status = "completed";
                    }

                    return TodaySession.builder()
                            .id(s.getId())
                            .classId(s.getClassEntity() != null ? s.getClassEntity().getId() : null)
                            .time(time)
                            .className(className)
                            .teacher(teacher)
                            .room(room)
                            .students(studentCount)
                            .status(status)
                            .build();
                })
                .toList();
    }

    // ── 4. Today Attendance ───────────────────────────────────────────

    private TodayAttendance buildTodayAttendance() {
        java.time.ZoneId vnZone = java.time.ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDate today = LocalDate.now(vnZone);
        LocalTime now = LocalTime.now(vnZone);
        List<ClassSession> todaySessions = sessionRepository.findByDate(today);

        int present = 0, absent = 0, late = 0, total = 0;
        
        for (ClassSession session : todaySessions) {
            if (session.getStatus() == SessionStatus.cancelled) continue;
            if (session.getClassEntity() == null) continue;
            if (session.getClassEntity().getStatus() != ClassStatus.active) continue;
            
            int classTotal = (int) enrollmentRepository.countByClassEntityId(session.getClassEntity().getId());
            total += classTotal;

            List<AttendanceRecord> records = attendanceRepository.findBySessionId(session.getId());
            
            int sessionPresent = 0;
            int sessionLate = 0;
            int sessionAbsentExplicit = 0;

            for (AttendanceRecord r : records) {
                switch (r.getStatus()) {
                    case present -> sessionPresent++;
                    case late -> sessionLate++;
                    case absent, absent_excused -> sessionAbsentExplicit++;
                }
            }
            
            present += sessionPresent;
            late += sessionLate;
            
            // Xử lý Vắng mặt (Absent) dựa theo ranh giới dòng thời gian
            if (session.getStartTime() != null && session.getStartTime().isAfter(now) && session.getStatus() != SessionStatus.completed) {
                // Lớp tương lai chưa học: Chỉ được tính Vắng với những cá nhân CHỦ ĐỘNG XIN NGHỈ TRƯỚC (có record explicit)
                absent += sessionAbsentExplicit;
            } else {
                // Lớp đã & đang học: Suy diễn (Inferred) toàn bộ học viên vô danh (không có record) thành Vắng mặt
                int inferredAbsent = classTotal - (sessionPresent + sessionLate);
                absent += Math.max(0, inferredAbsent);
            }
        }

        return TodayAttendance.builder()
                .total(total)
                .present(present)
                .absent(absent)
                .late(late)
                .build();
    }

    // ── 5. Alerts ─────────────────────────────────────────────────────

    private List<AlertItem> buildAlerts() {
        List<AlertItem> alerts = new ArrayList<>();
        int alertId = 1;

        // Alert: invoices quá hạn
        long overdueCount = invoiceRepository.countByStatus(InvoiceStatus.overdue);
        if (overdueCount > 0) {
            alerts.add(AlertItem.builder()
                    .id(alertId++)
                    .type("warning")
                    .message(overdueCount + " hóa đơn học phí quá hạn thanh toán")
                    .action("Xem chi tiết")
                    .link("/admin/tuition")
                    .build());
        }

        // Alert: invoices đang chờ xác nhận
        long reviewingCount = invoiceRepository.countByStatus(InvoiceStatus.reviewing);
        if (reviewingCount > 0) {
            alerts.add(AlertItem.builder()
                    .id(alertId++)
                    .type("info")
                    .message(reviewingCount + " hóa đơn đang chờ xác nhận thanh toán")
                    .action("Duyệt ngay")
                    .link("/admin/tuition")
                    .build());
        }

        // Alert: lớp sắp đầy (>90% capacity)
        List<com.meilearning.backend.entity.ClassEntity> activeClasses = classRepository.findByStatus(ClassStatus.active);
        long nearFullCount = activeClasses.stream()
                .filter(c -> {
                    long enrolled = enrollmentRepository.countByClassEntityId(c.getId());
                    return c.getMaxStudents() > 0 && (double) enrolled / c.getMaxStudents() >= 0.9;
                })
                .count();
        if (nearFullCount > 0) {
            alerts.add(AlertItem.builder()
                    .id(alertId++)
                    .type("info")
                    .message(nearFullCount + " lớp học sắp đầy (>90% sĩ số)")
                    .action("Xem lớp")
                    .link("/admin/classes")
                    .build());
        }

        return alerts;
    }

    // ── 6. Overdue Students ───────────────────────────────────────────

    private List<OverdueItem> buildOverdueStudents() {
        List<TuitionInvoice> overdueInvoices = invoiceRepository.findByStatus(InvoiceStatus.overdue);
        LocalDate today = LocalDate.now();

        return overdueInvoices.stream()
                .sorted(Comparator.comparingLong(inv -> {
                    long days = ChronoUnit.DAYS.between(((TuitionInvoice) inv).getDueDate(), today);
                    return -days; // sort desc by overdue days
                }))
                .limit(5) // top 5
                .map(inv -> {
                    String studentName = inv.getStudent() != null && inv.getStudent().getUser() != null
                            ? inv.getStudent().getUser().getName() : "N/A";
                    String className = inv.getClassEntity() != null
                            ? inv.getClassEntity().getName() : "";
                    long overdueDays = ChronoUnit.DAYS.between(inv.getDueDate(), today);
                    long amount = inv.getTotalAmount();

                    return OverdueItem.builder()
                            .studentId(inv.getStudent() != null ? inv.getStudent().getId() : null)
                            .invoiceId(String.valueOf(inv.getId()))
                            .name(studentName)
                            .className(className)
                            .amount(formatCurrency(amount))
                            .days((int) Math.max(overdueDays, 0))
                            .build();
                })
                .toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private String formatCurrency(long amount) {
        if (amount >= 1_000_000) {
            return Math.round(amount / 1_000_000.0) + "M đ";
        } else if (amount > 0) {
            return NumberFormat.getInstance(Locale.forLanguageTag("vi-VN")).format(amount) + "đ";
        }
        return "0đ";
    }
}
