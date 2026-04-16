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

    private final com.meilearning.backend.service.NotificationDispatcher notificationDispatcher;

    private static final int GRACE_MINUTES = 5;

    @Scheduled(fixedRate = 5 * 60 * 1000) // mỗi 5 phút
    @Transactional
    public void autoConfirmExpiredSessions() {
        java.time.ZoneId vnZone = java.time.ZoneId.of("Asia/Ho_Chi_Minh");
        java.time.LocalDateTime currentDateTime = java.time.LocalDateTime.now(vnZone);
        
        // Lấy TẤT CẢ session có ngày <= hôm nay mà chưa được chốt (bao gồm cả hôm qua, hôm kia bị sót)
        List<ClassSession> uncompletedSessions = sessionRepository.findByStatusAndDateLessThanEqual(
                SessionStatus.upcoming, 
                currentDateTime.toLocalDate()
        );

        int confirmed = 0;
        for (ClassSession session : uncompletedSessions) {
            // Tính toán Deadline bằng LocalDateTime để tránh lỗi tràn giờ (wrap-around lúc nửa đêm)
            java.time.LocalDateTime endDateTime = session.getDate().atTime(session.getEndTime());
            java.time.LocalDateTime deadline = endDateTime.plusMinutes(GRACE_MINUTES);
            
            // Nếu thời điểm hiện tại VẪN CHƯA VƯỢT QUÁ deadline -> Bỏ qua
            if (currentDateTime.isBefore(deadline)) {
                continue;
            }

            // Đã quá deadline -> Auto Chốt!
            Long classId = session.getClassEntity().getId();
            List<ClassEnrollment> enrollments = enrollmentRepository.findByClassEntityId(classId);

            Set<Long> attendedStudentIds = attendanceRepository.findBySessionId(session.getId())
                    .stream()
                    .map(r -> r.getStudent().getId())
                    .collect(Collectors.toSet());

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

                    // Gửi thông báo khẩn ngay khi auto-confirm (tương tự như hành động manual)
                    if (enrollment.getStudent().getUser() != null) {
                        String className = session.getClassEntity() != null ? session.getClassEntity().getName() : "";
                        notificationDispatcher.notifyUrgent(
                                enrollment.getStudent().getUser(),
                                "absence",
                                "Thông báo vắng học",
                                "Học viên " + enrollment.getStudent().getUser().getName() 
                                        + " vắng buổi học ngày " + session.getDate() 
                                        + " - Lớp " + className
                        );
                    }
                }
            }

            session.setStatus(SessionStatus.completed);
            sessionRepository.save(session);
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
