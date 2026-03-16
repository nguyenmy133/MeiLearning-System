package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.request.CreateLeaveRequest;
import com.meilearning.backend.dto.response.LeaveRequestResponse;
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
    private final AcademicMapper mapper;
    private final NotificationDispatcher notificationDispatcher;

    @Override
    public LeaveRequestResponse create(CreateLeaveRequest req) {

        User requester = userRepository.findById(req.getRequesterId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + req.getRequesterId()));

        LeaveRequest lr = LeaveRequest.builder()
                .requester(requester)
                .requesterType(RequesterType.valueOf(req.getRequesterType()))
                .type(LeaveType.valueOf(req.getType()))
                .reason(req.getReason())
                .build();

        if (req.getSessionId() != null) {
            ClassSession session = sessionRepository.findById(req.getSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

            lr.setSession(session);

        }

        lr = leaveRepository.save(lr);

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

}
