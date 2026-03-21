package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.request.CreateLeaveRequest;
import com.meilearning.backend.dto.response.LeaveRequestResponse;
import com.meilearning.backend.dto.response.LeaveStatsResponse;
import com.meilearning.backend.entity.*;
import com.meilearning.backend.entity.enums.*;
import com.meilearning.backend.exception.BusinessException;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.mapper.AcademicMapper;
import com.meilearning.backend.repository.*;
import com.meilearning.backend.service.LeaveService;
import com.meilearning.backend.service.NotificationDispatcher;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.util.SpecHelper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import java.time.Instant;
import java.util.List;
@Service
@RequiredArgsConstructor
@Transactional
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final UserRepository userRepository;
    private final ClassSessionRepository sessionRepository;
    private final TeacherRepository teacherRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StudentRepository studentRepository;
    private final AcademicMapper mapper;
    private final NotificationDispatcher notificationDispatcher;

    @Override
    public LeaveRequestResponse create(CreateLeaveRequest req) {

        User requester = userRepository.findById(req.getRequesterId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + req.getRequesterId()));

        ClassSession session = null;
        if (req.getSessionId() != null) {
            session = sessionRepository.findById(req.getSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        }

        LeaveRequest lr = LeaveRequest.builder()
                .requester(requester)
                .requesterType(RequesterType.valueOf(req.getRequesterType()))
                .type(LeaveType.valueOf(req.getType()))
                .reason(req.getReason())
                .session(session)
                .build();

        lr = leaveRepository.save(lr);

        // Notify teacher: có đơn xin nghỉ mới từ học viên
        // Dùng session variable gốc (đã fully loaded) thay vì lr.getSession() (có thể lazy)
        if (session != null
                && session.getClassEntity() != null
                && session.getClassEntity().getTeacher() != null) {
            User teacherUser = session.getClassEntity().getTeacher().getUser();
            String sessionInfo = " ngày " + session.getDate();
            String typeLabel = lr.getType() == LeaveType.leave ? "xin nghỉ" : "đi muộn";
            notificationDispatcher.notifyWithEmail(
                    teacherUser,
                    "leave_new",
                    "Đơn " + typeLabel + " mới",
                    requester.getName() + " đã gửi đơn " + typeLabel + sessionInfo
                            + " — lớp " + session.getClassEntity().getName() + "."
            );
        }

        return mapper.toLeaveResponse(lr);

    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<LeaveRequestResponse> getAll(String status, String requesterType,
                                                      int page, int limit) {
        if (page < 1) page = 1;
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Specification<LeaveRequest> spec = SpecHelper.empty();
        if (status != null && !status.isBlank()) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), RequestStatus.valueOf(status)));
        }
        if (requesterType != null && !requesterType.isBlank()) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("requesterType"), RequesterType.valueOf(requesterType)));
        }
        Page<LeaveRequest> result = leaveRepository.findAll(spec, pageable);
        return PageResponse.<LeaveRequestResponse>builder()
                .data(result.getContent().stream().map(mapper::toLeaveResponse).toList())
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(result.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getAll(String status, String requesterType) {

        List<LeaveRequest> list;

        if (status != null) {
            list = leaveRepository.findByStatus(RequestStatus.valueOf(status));

        } else if (requesterType != null) {
            list = leaveRepository.findByRequesterType(RequesterType.valueOf(requesterType));

        } else {
            list = leaveRepository.findAll();

        }

        return list.stream().map(mapper::toLeaveResponse).toList();

    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getByRequester(Long requesterId) {

        return leaveRepository.findByRequesterId(requesterId).stream()
                .map(mapper::toLeaveResponse).toList();

    }

    @Override
    public LeaveRequestResponse approve(Long id, Long reviewerId) {

        LeaveRequest lr = findLeave(id);

        if (lr.getStatus() != RequestStatus.pending)
            throw new BusinessException("Chỉ duyệt đơn đang pending.");

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));

        lr.setStatus(RequestStatus.approved);
        lr.setReviewedBy(reviewer);
        lr.setReviewedAt(Instant.now());

        lr = leaveRepository.save(lr);
        final LeaveRequest savedLr = lr;

        // ── Side-effect: tạo/update AttendanceRecord = absent_excused ──
        // Để tuition service tự động miễn phí buổi này
        if (savedLr.getSession() != null && savedLr.getRequester() != null) {
            studentRepository.findByUserId(savedLr.getRequester().getId())
                    .ifPresent(student -> {
                        var existing = attendanceRecordRepository
                                .findBySessionIdAndStudentId(savedLr.getSession().getId(), student.getId());
                        if (existing.isPresent()) {
                            // Đã có record → update status
                            existing.get().setStatus(AttendanceStatus.absent_excused);
                            existing.get().setNote("Nghỉ có phép — đơn #" + savedLr.getId());
                            attendanceRecordRepository.save(existing.get());
                        } else {
                            // Chưa có → tạo mới
                            attendanceRecordRepository.save(
                                    AttendanceRecord.builder()
                                            .session(savedLr.getSession())
                                            .student(student)
                                            .status(AttendanceStatus.absent_excused)
                                            .note("Nghỉ có phép — đơn #" + savedLr.getId())
                                            .build()
                            );
                        }
                    });
        }

        // Notify requester: đơn đã được duyệt
        if (lr.getRequester() != null) {
            String sessionInfo = lr.getSession() != null
                    ? " ngày " + lr.getSession().getDate() : "";
            notificationDispatcher.notifyWithEmail(
                    lr.getRequester(),
                    "leave_approved",
                    "Đơn xin nghỉ đã được duyệt",
                    "Đơn xin nghỉ" + sessionInfo + " đã được duyệt."
            );
        }

        return mapper.toLeaveResponse(lr);

    }

    @Override
    public LeaveRequestResponse reject(Long id, Long reviewerId, String reason) {

        LeaveRequest lr = findLeave(id);

        if (lr.getStatus() != RequestStatus.pending)
            throw new BusinessException("Chỉ từ chối đơn đang pending.");

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));

        lr.setStatus(RequestStatus.rejected);
        lr.setReviewedBy(reviewer);
        lr.setReviewedAt(Instant.now());
        lr.setRejectReason(reason);

        lr = leaveRepository.save(lr);

        // Notify requester: đơn bị từ chối
        if (lr.getRequester() != null) {
            String sessionInfo = lr.getSession() != null
                    ? " ngày " + lr.getSession().getDate() : "";
            notificationDispatcher.notifyWithEmail(
                    lr.getRequester(),
                    "leave_rejected",
                    "Đơn xin nghỉ bị từ chối",
                    "Đơn xin nghỉ" + sessionInfo + " đã bị từ chối. Lý do: " + reason
            );
        }

        return mapper.toLeaveResponse(lr);

    }

    private LeaveRequest findLeave(Long id) {
        return leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found: " + id));
    }

    @Override
    public void cancel(Long id, Long requesterId) {
        LeaveRequest lr = findLeave(id);
        if (lr.getStatus() != RequestStatus.pending)
            throw new BusinessException("Chỉ có thể huỷ đơn đang chờ duyệt.");
        if (!lr.getRequester().getId().equals(requesterId))
            throw new BusinessException("Bạn không có quyền huỷ đơn này.");
        leaveRepository.delete(lr);
    }

    @Override
    @Transactional(readOnly = true)
    public LeaveStatsResponse getStats(String requesterType) {
        RequesterType rType = requesterType != null ? RequesterType.valueOf(requesterType) : null;

        long pending, approved, rejected, total;
        if (rType != null) {
            pending  = leaveRepository.countByRequesterTypeAndStatus(rType, RequestStatus.pending);
            approved = leaveRepository.countByRequesterTypeAndStatus(rType, RequestStatus.approved);
            rejected = leaveRepository.countByRequesterTypeAndStatus(rType, RequestStatus.rejected);
        } else {
            pending  = leaveRepository.countByStatus(RequestStatus.pending);
            approved = leaveRepository.countByStatus(RequestStatus.approved);
            rejected = leaveRepository.countByStatus(RequestStatus.rejected);
        }
        total = pending + approved + rejected;

        return LeaveStatsResponse.builder()
                .total(total)
                .pending(pending)
                .approved(approved)
                .rejected(rejected)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> getByTeacherUsername(String username, String status) {
        Teacher teacher = teacherRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + username));

        // Lấy tất cả session ID tườ ng ứng với teacher
        List<Long> sessionIds = sessionRepository
                .findByClassEntityTeacherId(teacher.getId())
                .stream().map(ClassSession::getId).toList();

        if (sessionIds.isEmpty()) return List.of();

        List<LeaveRequest> list = leaveRepository.findBySessionIdIn(sessionIds);

        if (status != null && !status.isBlank()) {
            RequestStatus rs = RequestStatus.valueOf(status);
            list = list.stream().filter(lr -> lr.getStatus() == rs).toList();
        }
        return list.stream().map(mapper::toLeaveResponse).toList();
    }

}
