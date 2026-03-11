package meilearning.com.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import meilearning.com.backend.dto.request.CreateLeaveRequest;
import meilearning.com.backend.dto.response.LeaveRequestResponse;
import meilearning.com.backend.entity.*;
import meilearning.com.backend.entity.enums.*;
import meilearning.com.backend.exception.BusinessException;
import meilearning.com.backend.exception.ResourceNotFoundException;
import meilearning.com.backend.mapper.AcademicMapper;
import meilearning.com.backend.repository.*;
import meilearning.com.backend.service.LeaveService;

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
        return mapper.toLeaveResponse(lr);
    }

    private LeaveRequest findLeave(Long id) {
        return leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found: " + id));
    }
}
