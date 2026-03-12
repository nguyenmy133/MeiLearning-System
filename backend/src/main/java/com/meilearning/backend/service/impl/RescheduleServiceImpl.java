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
import com.meilearning.backend.service.RescheduleService;

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
                .reason(req.getReason())
                .build();

        if (req.getSessionId() != null) {
            ClassSession session = sessionRepository.findById(req.getSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
            rr.setSession(session);
        }

        rr = rescheduleRepository.save(rr);
        return mapper.toRescheduleResponse(rr);
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
            throw new BusinessException("Chá»‰ duyá»‡t yĂªu cáº§u Ä‘ang pending.");

        rr.setStatus(RequestStatus.approved);
        rr.setReviewedBy(reviewedBy);
        rr.setReviewedAt(Instant.now());

        // Náº¿u cancel â†’ Ä‘Ă¡nh dáº¥u session lĂ  cancelled
        if (rr.getType() == RescheduleType.cancel && rr.getSession() != null) {
            rr.getSession().setStatus(SessionStatus.cancelled);
            sessionRepository.save(rr.getSession());
        }

        rr = rescheduleRepository.save(rr);
        return mapper.toRescheduleResponse(rr);
    }

    @Override
    public RescheduleRequestResponse reject(Long id, String reviewedBy, String reason) {
        RescheduleRequest rr = findRequest(id);
        if (rr.getStatus() != RequestStatus.pending)
            throw new BusinessException("Chá»‰ tá»« chá»‘i yĂªu cáº§u Ä‘ang pending.");

        rr.setStatus(RequestStatus.rejected);
        rr.setReviewedBy(reviewedBy);
        rr.setReviewedAt(Instant.now());
        rr.setRejectReason(reason);
        rr = rescheduleRepository.save(rr);
        return mapper.toRescheduleResponse(rr);
    }

    private RescheduleRequest findRequest(Long id) {
        return rescheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reschedule request not found: " + id));
    }
}
