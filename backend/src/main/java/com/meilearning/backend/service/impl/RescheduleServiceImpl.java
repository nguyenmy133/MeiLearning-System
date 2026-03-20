package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.request.CreateRescheduleRequest;
import com.meilearning.backend.dto.response.RescheduleRequestResponse;
import com.meilearning.backend.entity.*;
import com.meilearning.backend.entity.enums.*;
import com.meilearning.backend.exception.BusinessException;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.mapper.AcademicMapper;
import com.meilearning.backend.repository.*;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.service.RescheduleService;
import com.meilearning.backend.service.NotificationDispatcher;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.util.SpecHelper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
@Service
@RequiredArgsConstructor
@Transactional
public class RescheduleServiceImpl implements RescheduleService {

    private final RescheduleRequestRepository rescheduleRepository;
    private final TeacherRepository teacherRepository;
    private final ClassRepository classRepository;
    private final ClassSessionRepository sessionRepository;
    private final AcademicMapper mapper;
    private final NotificationDispatcher notificationDispatcher;
    private final ClassEnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Override
    public RescheduleRequestResponse create(CreateRescheduleRequest req) {

        Teacher teacher = teacherRepository.findById(req.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        ClassEntity classEntity = classRepository.findById(req.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        RescheduleRequest rr = RescheduleRequest.builder()
                .teacher(teacher)
                .classEntity(classEntity)
                .type(RescheduleType.valueOf(req.getType()))
                .originalDate(LocalDate.parse(req.getOriginalDate()))
                .originalTime(req.getOriginalTime())
                .requestedDate(req.getRequestedDate() != null ? LocalDate.parse(req.getRequestedDate()) : null)
                .requestedTime(req.getRequestedTime())
                .requestedEndTime(req.getRequestedEndTime())
                .reason(req.getReason())
                .build();

        if (req.getSessionId() != null) {
            ClassSession session = sessionRepository.findById(req.getSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

            rr.setSession(session);

        }

        final RescheduleRequest saved = rescheduleRepository.save(rr);

        // Notify tất cả admin về yêu cầu đổi lịch mới
        String teacherName = saved.getTeacher() != null && saved.getTeacher().getUser() != null
                ? saved.getTeacher().getUser().getName() : "Giáo viên";
        String className  = saved.getClassEntity() != null ? saved.getClassEntity().getName() : "";
        String notifyTitle   = "Yêu cầu " + saved.getType() + " lịch mới";
        String notifyContent = "Giáo viên " + teacherName + " vừa gửi yêu cầu "
                + saved.getType() + " cho lớp " + className
                + " ngày " + saved.getOriginalDate() + ". Vui lòng xem xét và duyệt.";

        userRepository.findByRole(User.Role.admin).forEach(admin ->
                notificationDispatcher.notifyInApp(admin, "schedule_change", notifyTitle, notifyContent)
        );

        return mapper.toRescheduleResponse(saved);

    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RescheduleRequestResponse> getAll(String status, int page, int limit) {
        if (page < 1) page = 1;
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Specification<RescheduleRequest> spec = SpecHelper.empty();
        if (status != null && !status.isBlank()) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), RequestStatus.valueOf(status)));
        }
        Page<RescheduleRequest> result = rescheduleRepository.findAll(spec, pageable);
        return PageResponse.<RescheduleRequestResponse>builder()
                .data(result.getContent().stream().map(mapper::toRescheduleResponse).toList())
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(result.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RescheduleRequestResponse> getAll(String status) {

        List<RescheduleRequest> list = status != null

                ? rescheduleRepository.findByStatus(RequestStatus.valueOf(status))

                : rescheduleRepository.findAll();

        return list.stream().map(mapper::toRescheduleResponse).toList();

    }

    @Override
    @Transactional(readOnly = true)
    public List<RescheduleRequestResponse> getByTeacher(Long teacherId) {

        return rescheduleRepository.findByTeacherId(teacherId).stream()
                .map(mapper::toRescheduleResponse).toList();

    }

    @Override
    public RescheduleRequestResponse approve(Long id, String reviewedBy) {

        RescheduleRequest rr = findRequest(id);

        if (rr.getStatus() != RequestStatus.pending)
            throw new BusinessException("Chỉ duyệt yêu cầu đang pending.");

        rr.setStatus(RequestStatus.approved);
        rr.setReviewedBy(reviewedBy);
        rr.setReviewedAt(Instant.now());

        // Nếu cancel → đánh dấu session là cancelled
        if (rr.getType() == RescheduleType.cancel && rr.getSession() != null) {
            rr.getSession().setStatus(SessionStatus.cancelled);

            sessionRepository.save(rr.getSession());
        }

        // Nếu reschedule → hủy session gốc + tạo session mới
        if (rr.getType() == RescheduleType.reschedule) {
            // 1) Hủy session gốc
            if (rr.getSession() != null) {
                rr.getSession().setStatus(SessionStatus.cancelled);
                sessionRepository.save(rr.getSession());
            }
            // 2) Tạo session mới với ngày/giờ đã yêu cầu
            if (rr.getRequestedDate() != null && rr.getRequestedTime() != null) {
                java.time.LocalTime startTime = java.time.LocalTime.parse(rr.getRequestedTime());
                java.time.LocalTime endTime = rr.getRequestedEndTime() != null
                        ? java.time.LocalTime.parse(rr.getRequestedEndTime())
                        : startTime.plusHours(2); // fallback 2h

                ClassSession newSession = ClassSession.builder()
                        .classEntity(rr.getClassEntity())
                        .date(rr.getRequestedDate())
                        .startTime(startTime)
                        .endTime(endTime)
                        .status(SessionStatus.upcoming)
                        .type(SessionType.makeup)
                        .notes("Đổi từ buổi " + rr.getOriginalDate())
                        .build();
                sessionRepository.save(newSession);
            }
        }

        final RescheduleRequest savedRr = rescheduleRepository.save(rr);

        String className = savedRr.getClassEntity() != null ? savedRr.getClassEntity().getName() : "";

        // Notify teacher (MEDIUM)
        if (savedRr.getTeacher() != null && savedRr.getTeacher().getUser() != null) {
            notificationDispatcher.notifyWithEmail(
                    savedRr.getTeacher().getUser(),
                    "schedule_change",
                    "Yêu cầu " + savedRr.getType() + " được duyệt",
                    "Yêu cầu " + savedRr.getType() + " cho lớp " + className
                            + " ngày " + savedRr.getOriginalDate() + " đã được duyệt."
            );
        }

        // Notify tất cả students trong lớp (MEDIUM)
        if (savedRr.getClassEntity() != null) {
            enrollmentRepository.findByClassEntityId(savedRr.getClassEntity().getId())
                    .forEach(enrollment -> {
                        if (enrollment.getStudent() != null && enrollment.getStudent().getUser() != null) {
                            notificationDispatcher.notifyWithEmail(
                                    enrollment.getStudent().getUser(),
                                    "schedule_change",
                                    "Lịch học lớp " + className + " thay đổi",
                                    "Lịch học lớp " + className + " ngày " + savedRr.getOriginalDate()
                                            + " đã được thay đổi. Vui lòng kiểm tra lịch mới."
                            );
                        }
                    });
        }

        return mapper.toRescheduleResponse(savedRr);

    }

    @Override
    public RescheduleRequestResponse reject(Long id, String reviewedBy, String reason) {

        RescheduleRequest rr = findRequest(id);

        if (rr.getStatus() != RequestStatus.pending)
            throw new BusinessException("Chỉ từ chối yêu cầu đang pending.");

        rr.setStatus(RequestStatus.rejected);
        rr.setReviewedBy(reviewedBy);
        rr.setReviewedAt(Instant.now());
        rr.setRejectReason(reason);

        rr = rescheduleRepository.save(rr);

        // Notify teacher: yêu cầu bị từ chối
        if (rr.getTeacher() != null && rr.getTeacher().getUser() != null) {
            String className = rr.getClassEntity() != null ? rr.getClassEntity().getName() : "";
            notificationDispatcher.notifyWithEmail(
                    rr.getTeacher().getUser(),
                    "schedule_change",
                    "Yêu cầu " + rr.getType() + " bị từ chối",
                    "Yêu cầu " + rr.getType() + " cho lớp " + className
                            + " ngày " + rr.getOriginalDate() + " đã bị từ chối. Lý do: " + reason
            );
        }

        return mapper.toRescheduleResponse(rr);

    }

    private RescheduleRequest findRequest(Long id) {

        return rescheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reschedule request not found: " + id));

    }

    @Override
    @Transactional(readOnly = true)
    public List<RescheduleRequestResponse> getByTeacherUsername(String username) {
        Teacher teacher = teacherRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + username));
        return rescheduleRepository.findByTeacherId(teacher.getId())
                .stream().map(mapper::toRescheduleResponse).toList();
    }

    @Override
    public RescheduleRequestResponse createByUsername(String username, CreateRescheduleRequest req) {
        Teacher teacher = teacherRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + username));

        // Override teacherId từ JWT — bảo mật, FE không thể giả mạo
        req.setTeacherId(teacher.getId());
        return create(req);
    }

}
