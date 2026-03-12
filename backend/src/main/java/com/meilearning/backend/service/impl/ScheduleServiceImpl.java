package com.meilearning.backend.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.meilearning.backend.dto.response.ClassSessionResponse;
import com.meilearning.backend.dto.response.ScheduleResponse;
import com.meilearning.backend.entity.ClassEntity;
import com.meilearning.backend.entity.ClassEnrollment;
import com.meilearning.backend.entity.ClassSession;
import com.meilearning.backend.entity.enums.ClassStatus;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.mapper.SessionMapper;
import com.meilearning.backend.repository.ClassEnrollmentRepository;
import com.meilearning.backend.repository.ClassRepository;
import com.meilearning.backend.repository.ClassSessionRepository;
import com.meilearning.backend.service.ScheduleService;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Collections;
import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ScheduleServiceImpl implements ScheduleService {

    private final ClassRepository classRepository;
    private final ClassSessionRepository sessionRepository;
    private final ClassEnrollmentRepository enrollmentRepository;
    private final SessionMapper sessionMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // â”€â”€ Generate Sessions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Override
    public void generateSessions(Long classId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("KhĂ´ng tĂ¬m tháº¥y lá»›p: " + classId));

        if (classEntity.getSchedule() == null || classEntity.getSchedule().isBlank()) {
            log.warn("Lá»›p {} khĂ´ng cĂ³ lá»‹ch há»c", classId);
            return;
        }

        List<Map<String, Object>> slots = parseSchedule(classEntity.getSchedule());
        if (slots.isEmpty()) return;

        LocalDate startDate = classEntity.getStartDate();
        LocalDate endDate = classEntity.getEndDate() != null
                ? classEntity.getEndDate()
                : startDate.plusMonths(3); // Default 3 thĂ¡ng

        // Generate sessions cho má»—i slot
        for (Map<String, Object> slot : slots) {
            int weekday = ((Number) slot.get("weekday")).intValue();
            String startTimeStr = (String) slot.get("startTime");
            String endTimeStr = (String) slot.get("endTime");

            DayOfWeek dayOfWeek = DayOfWeek.of(weekday == 0 ? 7 : weekday); // 0=CN â†’ 7
            LocalTime startTime = LocalTime.parse(startTimeStr);
            LocalTime endTime = LocalTime.parse(endTimeStr);

            // TĂ¬m ngĂ y Ä‘áº§u tiĂªn phĂ¹ há»£p
            LocalDate current = startDate.with(TemporalAdjusters.nextOrSame(dayOfWeek));

            while (!current.isAfter(endDate)) {
                // Kiá»ƒm tra Ä‘Ă£ tá»“n táº¡i chÆ°a
                List<ClassSession> existing = sessionRepository
                        .findByClassEntityIdAndDate(classId, current);
                boolean alreadyExists = existing.stream()
                        .anyMatch(s -> s.getStartTime().equals(startTime));

                if (!alreadyExists) {
                    ClassSession session = ClassSession.builder()
                            .classEntity(classEntity)
                            .date(current)
                            .startTime(startTime)
                            .endTime(endTime)
                            .build();
                    sessionRepository.save(session);
                }

                current = current.plusWeeks(1);
            }
        }

        log.info("ÄĂ£ generate sessions cho lá»›p {}", classEntity.getName());
    }

    @Override
    public void generateAllSessions() {
        List<ClassEntity> activeClasses = classRepository.findByStatus(ClassStatus.active);
        for (ClassEntity c : activeClasses) {
            generateSessions(c.getId());
        }
    }

    // â”€â”€ Get Schedule â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Override
    @Transactional(readOnly = true)
    public ScheduleResponse getSchedule(String date, String view) {
        LocalDate baseDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        var range = getDateRange(baseDate, view);

        List<ClassSession> sessions = sessionRepository
                .findByDateBetween(range[0], range[1]);

        return buildScheduleResponse(sessions, range[0], range[1], view);
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleResponse getTeacherSchedule(Long teacherId, String date, String view) {
        LocalDate baseDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        var range = getDateRange(baseDate, view);

        List<ClassSession> sessions = sessionRepository
                .findByClassEntityTeacherIdAndDateBetween(teacherId, range[0], range[1]);

        return buildScheduleResponse(sessions, range[0], range[1], view);
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleResponse getStudentSchedule(Long studentId, String date, String view) {
        LocalDate baseDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        var range = getDateRange(baseDate, view);

        // Láº¥y cĂ¡c classId mĂ  student enrolled
        List<ClassEnrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        List<Long> classIds = enrollments.stream()
                .map(e -> e.getClassEntity().getId())
                .toList();

        if (classIds.isEmpty()) {
            return ScheduleResponse.builder()
                    .startDate(range[0].toString())
                    .endDate(range[1].toString())
                    .view(view)
                    .sessions(Collections.emptyList())
                    .totalSessions(0)
                    .build();
        }

        // Láº¥y táº¥t cáº£ sessions trong range cho cĂ¡c class Ä‘Ă£ enrolled
        List<ClassSession> allSessions = sessionRepository.findByDateBetween(range[0], range[1]);
        List<ClassSession> filtered = allSessions.stream()
                .filter(s -> classIds.contains(s.getClassEntity().getId()))
                .toList();

        return buildScheduleResponse(filtered, range[0], range[1], view);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassSessionResponse> getClassSessions(Long classId) {
        List<ClassSession> sessions = sessionRepository.findByClassEntityId(classId);
        return sessions.stream().map(sessionMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClassSessionResponse getSessionById(Long id) {
        ClassSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("KhĂ´ng tĂ¬m tháº¥y buá»•i há»c: " + id));
        return sessionMapper.toResponse(session);
    }

    // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private ScheduleResponse buildScheduleResponse(List<ClassSession> sessions,
                                                    LocalDate startDate, LocalDate endDate, String view) {
        List<ClassSessionResponse> responses = sessions.stream()
                .map(sessionMapper::toResponse)
                .toList();

        return ScheduleResponse.builder()
                .startDate(startDate.toString())
                .endDate(endDate.toString())
                .view(view != null ? view : "week")
                .sessions(responses)
                .totalSessions(responses.size())
                .build();
    }

    private LocalDate[] getDateRange(LocalDate baseDate, String view) {
        if ("day".equalsIgnoreCase(view)) {
            return new LocalDate[]{baseDate, baseDate};
        } else if ("month".equalsIgnoreCase(view)) {
            return new LocalDate[]{
                    baseDate.withDayOfMonth(1),
                    baseDate.with(TemporalAdjusters.lastDayOfMonth())
            };
        } else { // default: week
            LocalDate monday = baseDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            return new LocalDate[]{monday, monday.plusDays(6)};
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseSchedule(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            log.warn("Cannot parse schedule JSON: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
