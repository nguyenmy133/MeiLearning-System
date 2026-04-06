package com.meilearning.backend.scheduler;

import com.meilearning.backend.entity.AttendanceRecord;
import com.meilearning.backend.entity.ClassEnrollment;
import com.meilearning.backend.entity.ClassSession;
import com.meilearning.backend.entity.enums.AttendanceStatus;
import com.meilearning.backend.entity.enums.CheckInMethod;
import com.meilearning.backend.entity.enums.SessionStatus;
import com.meilearning.backend.repository.AttendanceQrTokenRepository;
import com.meilearning.backend.repository.AttendanceRecordRepository;
import com.meilearning.backend.repository.ClassEnrollmentRepository;
import com.meilearning.backend.repository.ClassSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Tự động chốt điểm danh cho các buổi học đã kết thúc mà teacher quên chốt.
 *
 * Điều kiện: session.status = upcoming, date = hôm nay, endTime + 5 phút < now.
 * Hành động: tạo record absent cho student chưa có record → session = completed.
 *
 * Chạy mỗi 5 phút.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AttendanceAutoConfirmScheduler {

    private final ClassSessionRepository sessionRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final ClassEnrollmentRepository enrollmentRepository;
    private final AttendanceQrTokenRepository qrTokenRepository;

    private static final int GRACE_MINUTES = 5;

    @Scheduled(fixedRate = 5 * 60 * 1000) // mỗi 5 phút
    @Transactional
    public void autoConfirmExpiredSessions() {
        java.time.ZoneId vnZone = java.time.ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDate today = LocalDate.now(vnZone);
        LocalTime now = LocalTime.now(vnZone);

        // Lấy tất cả session hôm nay còn upcoming
        List<ClassSession> upcomingSessions = sessionRepository.findByDateAndStatus(today, SessionStatus.upcoming);

        int confirmed = 0;
        for (ClassSession session : upcomingSessions) {
            // Chỉ chốt nếu đã quá endTime + GRACE_MINUTES
            LocalTime deadline = session.getEndTime().plusMinutes(GRACE_MINUTES);
            if (now.isBefore(deadline)) continue;

            // Lấy danh sách student enrolled
            Long classId = session.getClassEntity().getId();
            List<ClassEnrollment> enrollments = enrollmentRepository.findByClassEntityId(classId);

            // Lấy student đã có record
            Set<Long> attendedStudentIds = attendanceRepository.findBySessionId(session.getId())
                    .stream()
                    .map(r -> r.getStudent().getId())
                    .collect(Collectors.toSet());

            // Tạo absent record cho student chưa điểm danh
            for (ClassEnrollment enrollment : enrollments) {
                Long studentId = enrollment.getStudent().getId();
                if (!attendedStudentIds.contains(studentId)) {
                    AttendanceRecord absentRecord = AttendanceRecord.builder()
                            .session(session)
                            .student(enrollment.getStudent())
                            .status(AttendanceStatus.absent)
                            .method(CheckInMethod.manual)
                            .note("Tự động chốt - giáo viên không chốt")
                            .build();
                    attendanceRepository.save(absentRecord);
                }
            }

            // Chốt session
            session.setStatus(SessionStatus.completed);
            sessionRepository.save(session);

            // Deactivate QR tokens
            qrTokenRepository.deactivateBySessionId(session.getId());

            log.info("Auto-confirmed session id={}, class='{}', date={}, endTime={}",
                    session.getId(),
                    session.getClassEntity().getName(),
                    session.getDate(),
                    session.getEndTime());
            confirmed++;
        }

        if (confirmed > 0) {
            log.info("Auto-confirmed {} expired sessions", confirmed);
        }
    }
}
