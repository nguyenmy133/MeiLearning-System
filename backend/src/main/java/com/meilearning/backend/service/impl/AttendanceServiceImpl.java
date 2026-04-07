package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.request.BulkAttendanceRequest;
import com.meilearning.backend.dto.response.AttendanceResponse;
import com.meilearning.backend.dto.response.AttendanceStatsResponse;
import com.meilearning.backend.dto.response.ClassSessionResponse;
import com.meilearning.backend.dto.response.QrTokenResponse;
import com.meilearning.backend.entity.AttendanceQrToken;
import com.meilearning.backend.entity.AttendanceRecord;
import com.meilearning.backend.entity.ClassEnrollment;
import com.meilearning.backend.entity.ClassSession;
import com.meilearning.backend.entity.QrSettings;
import com.meilearning.backend.entity.Student;
import com.meilearning.backend.entity.Teacher;
import com.meilearning.backend.entity.enums.AttendanceStatus;
import com.meilearning.backend.entity.enums.CheckInMethod;
import com.meilearning.backend.entity.enums.SessionStatus;
import com.meilearning.backend.exception.BusinessException;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.mapper.SessionMapper;
import com.meilearning.backend.repository.AttendanceQrTokenRepository;
import com.meilearning.backend.repository.AttendanceRecordRepository;
import com.meilearning.backend.repository.ClassSessionRepository;
import com.meilearning.backend.repository.StudentRepository;
import com.meilearning.backend.repository.TeacherRepository;
import com.meilearning.backend.service.AttendanceService;
import com.meilearning.backend.service.NotificationDispatcher;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRecordRepository attendanceRepository;
    private final AttendanceQrTokenRepository qrTokenRepository;
    private final ClassSessionRepository sessionRepository;
    private final StudentRepository studentRepository;
    private final QrSettingsServiceImpl qrSettingsService;
    private final SessionMapper sessionMapper;
    private final NotificationDispatcher notificationDispatcher;
    private final TeacherRepository teacherRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getBySession(Long sessionId) {

        List<AttendanceRecord> records = attendanceRepository.findBySessionId(sessionId);
        return records.stream().map(sessionMapper::toAttendanceResponse).toList();
    }

    @Override
    public List<AttendanceResponse> bulkAttendance(BulkAttendanceRequest request) {
        ClassSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy buổi học: " + request.getSessionId()));

        // Guard: Không cho sửa/chốt lại session đã completed
        if (session.getStatus() == SessionStatus.completed) {
            throw new BusinessException("Buổi học đã được chốt điểm danh. Không thể chỉnh sửa.");
        }

        List<AttendanceRecord> saved = new ArrayList<>();

        for (var entry : request.getAttendances()) {
            Student student = studentRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                          "Không tìm thấy học viên: " + entry.getStudentId()));

            AttendanceStatus status = AttendanceStatus.valueOf(entry.getStatus());

        // Upsert: update nếu đã tồn tại
            AttendanceRecord record = attendanceRepository
                    .findBySessionIdAndStudentId(request.getSessionId(), entry.getStudentId())
                    .orElse(AttendanceRecord.builder()
                            .session(session)
                            .student(student)
                            .method(CheckInMethod.manual)
                            .build());

            record.setStatus(status);
            record.setNote(entry.getNote());
            saved.add(attendanceRepository.save(record));

      // Gửi thông báo khẩn cấp nếu vắng học

            if (status == AttendanceStatus.absent && student.getUser() != null) {
                String className = session.getClassEntity() != null
                        ? session.getClassEntity().getName() : "";
                notificationDispatcher.notifyUrgent(
                        student.getUser(),
                        "absence",
                        "Thông báo vắng học",
                        "Học viên " + student.getUser().getName()
                                + " vắng buổi học ngày "
                                + session.getDate() + " - Lớp " + className

                );

            }

        }

        // Chỉ chốt điểm danh khi confirm=true
        boolean shouldConfirm = Boolean.TRUE.equals(request.getConfirm());
        if (shouldConfirm && session.getStatus() == SessionStatus.upcoming) {
            session.setStatus(SessionStatus.completed);
            sessionRepository.save(session);
            // Huỷ tất cả QR token còn active — ngăn student scan sau khi chốt
            qrTokenRepository.deactivateBySessionId(session.getId());
        }

        return saved.stream().map(sessionMapper::toAttendanceResponse).toList();
    }

    @Override
    public AttendanceResponse qrCheckIn(Long sessionId, Long studentId) {

        ClassSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy buổi học: " + sessionId));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy học viên: " + studentId));

        // Kiểm tra đã check-in chưa
        if (attendanceRepository.existsBySessionIdAndStudentId(sessionId, studentId)) {
            throw new BusinessException("Học viên đã được điểm danh cho buổi học này.");
        }

        AttendanceRecord record = AttendanceRecord.builder()
                .session(session)
                .student(student)
                .status(AttendanceStatus.present)
                .checkInTime(LocalTime.now())
                .method(CheckInMethod.qr)
                .build();
        record = attendanceRepository.save(record);
        return sessionMapper.toAttendanceResponse(record);
    }

    // ── QR Token Generation ───────────────────────────────────────────────
    // Rate limiting: tối đa 1 lần tạo QR / 10 giây / session
    private final java.util.concurrent.ConcurrentHashMap<Long, Instant> qrRateLimit = new java.util.concurrent.ConcurrentHashMap<>();
    private static final long QR_RATE_LIMIT_SECONDS = 10;

    @Override
    public QrTokenResponse generateQrToken(Long sessionId) {
        // Rate limit check
        Instant lastGenerated = qrRateLimit.get(sessionId);
        if (lastGenerated != null && Instant.now().isBefore(lastGenerated.plusSeconds(QR_RATE_LIMIT_SECONDS))) {
            throw new BusinessException("Vui lòng đợi " + QR_RATE_LIMIT_SECONDS + " giây trước khi tạo lại mã QR.");
        }
        ClassSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy buổi học: " + sessionId));

        // Guard: Không cho tạo QR cho session đã chốt
        if (session.getStatus() == SessionStatus.completed) {
            throw new BusinessException("Buổi học đã được chốt điểm danh. Không thể tạo mã QR.");
        }

        // Fix timezone: dùng explicit ZoneId để tránh phụ thuộc container timezone
        java.time.ZoneId vnZone = java.time.ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDate today = LocalDate.now(vnZone);
        LocalTime now = LocalTime.now(vnZone);
        LocalTime earliestAllowed = session.getStartTime().minusMinutes(5);

        if (session.getDate().isAfter(today)) {
            throw new BusinessException(
                    "Chưa đến ngày học. Chỉ có thể bật QR vào ngày " + session.getDate());
        }
        if (session.getDate().isEqual(today) && now.isBefore(earliestAllowed)) {
            throw new BusinessException(
                    "Chưa đến giờ học. Có thể bật QR từ " + earliestAllowed);
        }

        // Đọc cấu hình QR (cached — không query DB mỗi lần)
        QrSettings settings = qrSettingsService.getCachedSettings();

        if (!Boolean.TRUE.equals(settings.getEnabled())) {
            throw new BusinessException("Chức năng QR điểm danh đang tắt.");
        }

        // Enforce allowRegenerate: nếu admin tắt, chỉ cho tạo QR 1 lần/session
        boolean hasActiveToken = qrTokenRepository
                .findBySessionIdAndActiveTrueAndExpiresAtAfter(sessionId, Instant.now())
                .isPresent();
        if (!Boolean.TRUE.equals(settings.getAllowRegenerate()) && hasActiveToken) {
            throw new BusinessException("Không được tạo lại mã QR. Vui lòng liên hệ quản trị viên.");
        }

        // Deactivate token cũ của session này
        qrTokenRepository.deactivateBySessionId(sessionId);

        // Tạo token mới
        String tokenStr = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusSeconds(settings.getExpiryMinutes() * 60L);

        AttendanceQrToken token = AttendanceQrToken.builder()
                .token(tokenStr)
                .session(session)
                .expiresAt(expiresAt)
                .active(true)
                .build();
        qrTokenRepository.save(token);
        qrRateLimit.put(sessionId, Instant.now()); // Record cho rate limiting

        return QrTokenResponse.builder()
                .token(tokenStr)
                .expiresAt(expiresAt)
                .expiryMinutes(settings.getExpiryMinutes())
                .sessionId(sessionId)
                .build();
    }

    // ── QR Token Check-in ─────────────────────────────────────────────────

    @Override
    public AttendanceResponse qrTokenCheckIn(String token, Long studentId) {
        // 1. Validate token
        AttendanceQrToken qrToken = qrTokenRepository.findByTokenAndActiveTrue(token)
                .orElseThrow(() -> new BusinessException("Mã QR không hợp lệ hoặc đã bị hủy."));

        // 2. Check expiration
        if (Instant.now().isAfter(qrToken.getExpiresAt())) {
            throw new BusinessException("Mã QR đã hết hạn. Vui lòng yêu cầu giáo viên tạo mã mới.");
        }

        // 3. Get session & student
        ClassSession session = qrToken.getSession();

        // Guard: Không cho check-in session đã chốt
        if (session.getStatus() == SessionStatus.completed) {
            throw new BusinessException("Buổi học đã được chốt điểm danh. Không thể điểm danh.");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy học viên: " + studentId));

        // 4. Check duplicate
        if (attendanceRepository.existsBySessionIdAndStudentId(session.getId(), studentId)) {
            throw new BusinessException("Bạn đã điểm danh buổi học này rồi.");
        }

        // 5. Determine status: present or late (đọc ngưỡng từ QR Settings)
        LocalTime now = LocalTime.now();
        AttendanceStatus status = AttendanceStatus.present;
        if (session.getStartTime() != null) {
            long minutesLate = java.time.Duration.between(session.getStartTime(), now).toMinutes();
            QrSettings qrSettings = qrSettingsService.getCachedSettings();
            if (minutesLate > qrSettings.getLateThresholdMinutes()) {
                status = AttendanceStatus.late;
            }
        }

        // 6. Create record
        AttendanceRecord record = AttendanceRecord.builder()
                .session(session)
                .student(student)
                .status(status)
                .checkInTime(now)
                .method(CheckInMethod.qr)
                .build();
        record = attendanceRepository.save(record);
        return sessionMapper.toAttendanceResponse(record);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceStatsResponse getStats(Long classId, String month) {
        YearMonth ym = month != null ? YearMonth.parse(month) : YearMonth.now();
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        // Single aggregate query instead of N+1 per-session loop
        List<Object[]> statusCounts = classId != null
                ? attendanceRepository.countByStatusForClassAndMonth(classId, startDate, endDate)
                : attendanceRepository.countByStatusForMonth(startDate, endDate);

        long totalSessions = classId != null
                ? attendanceRepository.countSessionsForClassAndMonth(classId, startDate, endDate)
                : attendanceRepository.countSessionsForMonth(startDate, endDate);

        long totalStudents = classId != null
                ? attendanceRepository.countDistinctStudentsForClassAndMonth(classId, startDate, endDate)
                : attendanceRepository.countDistinctStudentsForMonth(startDate, endDate);

        long todayPresentCount = attendanceRepository.countPresentToday(LocalDate.now());

        long presentCount = 0, absentCount = 0, lateCount = 0, excusedCount = 0;
        for (Object[] row : statusCounts) {
            AttendanceStatus status = (AttendanceStatus) row[0];
            long count = (Long) row[1];
            switch (status) {
                case present -> presentCount = count;
                case absent -> absentCount = count;
                case late -> lateCount = count;
                case absent_excused -> excusedCount = count;
            }
        }

        long totalRecords = presentCount + absentCount + lateCount + excusedCount;
        double rate = totalRecords > 0 ? (double) (presentCount + lateCount) / totalRecords * 100 : 0;

        return AttendanceStatsResponse.builder()
                .totalSessions(totalSessions)
                .todayPresentCount(todayPresentCount)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .lateCount(lateCount)
                .excusedCount(excusedCount)
                .attendanceRate(Math.round(rate * 100.0) / 100.0)
                .build();

    }


    @Override
    @Transactional(readOnly = true)
    public List<com.meilearning.backend.dto.response.ClassSessionResponse> getSessionsByTeacherUsername(String username, String date) {
        Teacher teacher = teacherRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy giáo viên: " + username));

        LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now();

        List<ClassSession> sessions = sessionRepository
                .findByClassEntityTeacherIdAndDate(teacher.getId(), targetDate);

        return sessions.stream()
                .filter(s -> s.getStatus() != SessionStatus.cancelled)
                .map(sessionMapper::toResponse).toList();
    }

    // ── Session Roster (enrolled students + attendance status) ─────────────

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getSessionRoster(Long sessionId) {
        ClassSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy buổi học: " + sessionId));

        // Get existing attendance records indexed by studentId
        List<AttendanceRecord> records = attendanceRepository.findBySessionId(sessionId);
        java.util.Map<Long, AttendanceRecord> recordMap = new java.util.HashMap<>();
        for (AttendanceRecord r : records) {
            recordMap.put(r.getStudent().getId(), r);
        }

        // Get all enrolled students
        List<ClassEnrollment> enrollments = session.getClassEntity().getEnrollments();
        List<AttendanceResponse> roster = new ArrayList<>();

        for (ClassEnrollment enrollment : enrollments) {
            Student student = enrollment.getStudent();
            AttendanceRecord record = recordMap.get(student.getId());

            if (record != null) {
                roster.add(sessionMapper.toAttendanceResponse(record));
            } else {
                // No record yet → return as "pending"
                roster.add(AttendanceResponse.builder()
                        .id(null)
                        .sessionId(sessionId)
                        .studentId(student.getId())
                        .studentName(student.getUser() != null ? student.getUser().getName() : "")
                        .status("pending")
                        .checkInTime(null)
                        .method(null)
                        .note(null)
                        .createdAt(null)
                        .build());
            }
        }
        return roster;
    }

    // ── Admin: All Sessions ───────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ClassSessionResponse> getAllSessions(Long classId, String date) {
        List<ClassSession> sessions;
        if (classId != null && date != null) {
            sessions = sessionRepository.findByClassEntityIdAndDate(classId, LocalDate.parse(date));
        } else if (classId != null) {
            // Issue #3: Chỉ lấy sessions đến hôm nay (không hiển thị ngày tương lai)
            sessions = sessionRepository.findByClassEntityIdAndDateLessThanEqual(classId, LocalDate.now());
        } else if (date != null) {
            sessions = sessionRepository.findByDate(LocalDate.parse(date));
        } else {
            // Default: today's sessions
            sessions = sessionRepository.findByDate(LocalDate.now());
        }
        return sessions.stream().map(sessionMapper::toResponse).toList();
    }

    // ── Admin: Update single record ───────────────────────────────────────

    @Override
    public AttendanceResponse updateRecord(Long recordId, String status, String note) {
        AttendanceRecord record = attendanceRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bản ghi điểm danh: " + recordId));
        record.setStatus(AttendanceStatus.valueOf(status));
        if (note != null) {
            record.setNote(note);
        }
        record = attendanceRepository.save(record);
        return sessionMapper.toAttendanceResponse(record);
    }

    // ── Student: Personal attendance records ──────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getStudentRecords(Long studentId, Long classId) {
        List<AttendanceRecord> records;
        if (classId != null) {
            records = attendanceRepository.findByStudentId(studentId).stream()
                    .filter(r -> r.getSession().getClassEntity().getId().equals(classId))
                    .toList();
        } else {
            records = attendanceRepository.findByStudentId(studentId);
        }
        return records.stream().map(sessionMapper::toAttendanceResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public QrTokenResponse getActiveQrToken(Long sessionId) {
        return qrTokenRepository
                .findBySessionIdAndActiveTrueAndExpiresAtAfter(sessionId, Instant.now())
                .map(token -> QrTokenResponse.builder()
                        .token(token.getToken())
                        .expiresAt(token.getExpiresAt())
                        .expiryMinutes(0) // not used for restore
                        .sessionId(sessionId)
                        .build())
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.meilearning.backend.dto.response.AttendanceActivityLogResponse> getUnusualActivityFeed() {
        List<AttendanceStatus> statuses = List.of(
                AttendanceStatus.late,
                AttendanceStatus.absent,
                AttendanceStatus.absent_excused
        );
        org.springframework.data.domain.Pageable top15 = org.springframework.data.domain.PageRequest.of(0, 15);
        List<AttendanceRecord> records = attendanceRepository.findUnusualActivityToday(statuses, LocalDate.now(), top15);

        return records.stream().map(r -> com.meilearning.backend.dto.response.AttendanceActivityLogResponse.builder()
                .id(r.getId())
                .timestamp(r.getCreatedAt())
                .studentName(r.getStudent().getUser() != null ? r.getStudent().getUser().getName() : "")
                .className(r.getSession().getClassEntity().getName())
                .status(r.getStatus().name())
                .updatedBy(r.getUpdatedBy() != null ? r.getUpdatedBy() : "System")
                .build()).toList();
    }

}
