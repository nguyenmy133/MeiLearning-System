package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.request.BulkAttendanceRequest;
import com.meilearning.backend.dto.response.AttendanceResponse;
import com.meilearning.backend.dto.response.AttendanceStatsResponse;
import com.meilearning.backend.entity.AttendanceRecord;
import com.meilearning.backend.entity.ClassSession;
import com.meilearning.backend.entity.Student;
import com.meilearning.backend.entity.Teacher;
import com.meilearning.backend.entity.enums.AttendanceStatus;
import com.meilearning.backend.entity.enums.CheckInMethod;
import com.meilearning.backend.entity.enums.SessionStatus;
import com.meilearning.backend.exception.BusinessException;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.mapper.SessionMapper;
import com.meilearning.backend.repository.AttendanceRecordRepository;
import com.meilearning.backend.repository.ClassSessionRepository;
import com.meilearning.backend.repository.StudentRepository;
import com.meilearning.backend.repository.TeacherRepository;
import com.meilearning.backend.service.AttendanceService;
import com.meilearning.backend.service.NotificationDispatcher;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRecordRepository attendanceRepository;
    private final ClassSessionRepository sessionRepository;
    private final StudentRepository studentRepository;
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

        // Đánh dấu session đã hoàn thành

        if (session.getStatus() == SessionStatus.upcoming) {
            session.setStatus(SessionStatus.completed);
            sessionRepository.save(session);

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

    @Override
    @Transactional(readOnly = true)
    public AttendanceStatsResponse getStats(Long classId, String month) {
        YearMonth ym = month != null ? YearMonth.parse(month) : YearMonth.now();
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();
        List<ClassSession> sessions = classId != null
                ? sessionRepository.findByClassEntityIdAndDateBetween(classId, startDate, endDate)
                : sessionRepository.findByDateBetween(startDate, endDate);
        long totalSessions = sessions.size();
        long presentCount = 0, absentCount = 0, lateCount = 0, excusedCount = 0;
        for (ClassSession session : sessions) {
            List<AttendanceRecord> records = attendanceRepository.findBySessionId(session.getId());
            for (AttendanceRecord r : records) {
                switch (r.getStatus()) {
                    case present -> presentCount++;
                    case absent -> absentCount++;
                    case late -> lateCount++;
                    case absent_excused -> excusedCount++;

                }
            }

        }

        long totalRecords = presentCount + absentCount + lateCount + excusedCount;
        double rate = totalRecords > 0 ? (double) (presentCount + lateCount) / totalRecords * 100 : 0;

        return AttendanceStatsResponse.builder()
                .totalSessions(totalSessions)
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

        return sessions.stream().map(sessionMapper::toResponse).toList();
    }

}
