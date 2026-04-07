package com.meilearning.backend.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.request.CreateSessionRequest;
import com.meilearning.backend.dto.request.UpdateSessionRequest;
import com.meilearning.backend.dto.response.ClassSessionResponse;
import com.meilearning.backend.dto.response.ScheduleResponse;
import com.meilearning.backend.entity.ClassEntity;
import com.meilearning.backend.entity.ClassEnrollment;
import com.meilearning.backend.entity.ClassSession;
import com.meilearning.backend.entity.Room;
import com.meilearning.backend.entity.Teacher;
import com.meilearning.backend.entity.enums.ClassStatus;
import com.meilearning.backend.entity.enums.SessionStatus;
import com.meilearning.backend.entity.enums.SessionType;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.mapper.SessionMapper;
import com.meilearning.backend.repository.ClassEnrollmentRepository;
import com.meilearning.backend.repository.ClassRepository;
import com.meilearning.backend.repository.ClassSessionRepository;
import com.meilearning.backend.repository.RoomRepository;
import com.meilearning.backend.repository.TeacherRepository;
import com.meilearning.backend.repository.AttendanceRecordRepository;
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
    private final RoomRepository roomRepository;
    private final SessionMapper sessionMapper;
    private final TeacherRepository teacherRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();


    @Override
    public void generateSessions(Long classId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp: " + classId));

        if (classEntity.getSchedule() == null || classEntity.getSchedule().isBlank()) {
            log.warn("Lớp {} không có lịch học", classId);
            return;
        }

        LocalDate endDate = classEntity.getEndDate() != null
                ? classEntity.getEndDate()
                : classEntity.getStartDate().plusMonths(3);

        generateSessionsForClass(classEntity, classEntity.getStartDate(), endDate);
    }

    /**
     * Core session generation logic — tái sử dụng cho cả create và auto-extend.
     * Tự skip sessions đã tồn tại (idempotent).
     */
    private void generateSessionsForClass(ClassEntity classEntity, LocalDate fromDate, LocalDate untilDate) {
        List<Map<String, Object>> slots = parseSchedule(classEntity.getSchedule());
        if (slots.isEmpty()) return;

        for (Map<String, Object> slot : slots) {
            int weekday = ((Number) slot.get("weekday")).intValue();
            String startTimeStr = (String) slot.get("startTime");
            String endTimeStr = (String) slot.get("endTime");
            DayOfWeek dayOfWeek = DayOfWeek.of(weekday == 0 ? 7 : weekday);
            LocalTime startTime = LocalTime.parse(startTimeStr);
            LocalTime endTime = LocalTime.parse(endTimeStr);

            LocalDate current = fromDate.with(TemporalAdjusters.nextOrSame(dayOfWeek));

            while (!current.isAfter(untilDate)) {
                List<ClassSession> existing = sessionRepository
                        .findByClassEntityIdAndDate(classEntity.getId(), current);
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
        log.info("Đã generate sessions cho lớp {}", classEntity.getName());
    }

    @Override
    public void generateAllSessions() {

        List<ClassEntity> classes = classRepository.findActiveAndUpcoming();

        for (ClassEntity c : classes) {
            generateSessions(c.getId());

        }

    }


    @Override
    public ScheduleResponse getSchedule(String date, String view, Long facilityId) {

        LocalDate baseDate = date != null ? LocalDate.parse(date) : LocalDate.now();

        var range = getDateRange(baseDate, view);

        // Auto-generate sessions for classes missing them
        ensureSessionsGenerated();

        List<ClassSession> sessions = sessionRepository
                .findByDateBetweenAndStatusNot(range[0], range[1], SessionStatus.cancelled)
                .stream()
                .filter(s -> s.getClassEntity().getStatus() != ClassStatus.completed)
                .toList();

        // Filter by facility if specified
        if (facilityId != null) {
            sessions = sessions.stream().filter(s -> {
                Room effectiveRoom = s.getRoomOverride() != null
                        ? s.getRoomOverride()
                        : s.getClassEntity().getRoom();
                return effectiveRoom != null
                        && effectiveRoom.getFacility() != null
                        && facilityId.equals(effectiveRoom.getFacility().getId());
            }).toList();
        }

        return buildScheduleResponse(sessions, range[0], range[1], view);

    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleResponse getTeacherSchedule(Long teacherId, String date, String view) {

        LocalDate baseDate = date != null ? LocalDate.parse(date) : LocalDate.now();

        var range = getDateRange(baseDate, view);

        List<ClassSession> sessions = sessionRepository
                .findByClassEntityTeacherIdAndDateBetweenAndStatusNot(teacherId, range[0], range[1], SessionStatus.cancelled)
                .stream()
                .filter(s -> s.getClassEntity().getStatus() != ClassStatus.completed)
                .toList();

        return buildScheduleResponse(sessions, range[0], range[1], view);

    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleResponse getMyTeacherSchedule(String username, String date, String view) {
        Teacher teacher = teacherRepository.findByUserUsername(username)
                .orElseThrow(() -> new com.meilearning.backend.exception.ResourceNotFoundException(
                        "Không tìm thấy giáo viên ướng với tài khoản: " + username));
        return getTeacherSchedule(teacher.getId(), date, view);
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleResponse getStudentSchedule(Long studentId, String date, String view) {

        LocalDate baseDate = date != null ? LocalDate.parse(date) : LocalDate.now();

        var range = getDateRange(baseDate, view);

        // Lấy các classId mà student enrolled

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

        // Lấy tất cả sessions trong range cho các class đã enrolled

        List<ClassSession> allSessions = sessionRepository
                .findByDateBetweenAndStatusNot(range[0], range[1], SessionStatus.cancelled)
                .stream()
                .filter(s -> s.getClassEntity().getStatus() != ClassStatus.completed)
                .toList();

        List<ClassSession> filtered = allSessions.stream()
                .filter(s -> classIds.contains(s.getClassEntity().getId()))
                .toList();

        // Enrich with per-student attendance status
        List<ClassSessionResponse> responses = filtered.stream()
                .map(sessionMapper::toResponse)
                .toList();

        for (ClassSessionResponse resp : responses) {
            attendanceRecordRepository
                    .findBySessionIdAndStudentId(resp.getId(), studentId)
                    .ifPresent(record -> resp.setAttendanceStatus(
                            record.getStatus().name().toUpperCase()
                    ));
        }

        return ScheduleResponse.builder()
                .startDate(range[0].toString())
                .endDate(range[1].toString())
                .view(view != null ? view : "week")
                .sessions(responses)
                .totalSessions(responses.size())
                .build();

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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy buổi học: " + id));

        return sessionMapper.toResponse(session);

    }


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

    /** Auto-generate sessions for active/upcoming classes that have no sessions yet */
    @Transactional
    public void ensureSessionsGenerated() {
        List<ClassEntity> classes = classRepository.findActiveAndUpcoming();
        for (ClassEntity c : classes) {
            if (c.getSchedule() != null && !c.getSchedule().isBlank()) {
                long count = sessionRepository.countByClassEntityId(c.getId());
                if (count == 0) {
                    generateSessions(c.getId());
                }
            }
        }
    }

    @Override
    @Transactional
    public ClassSessionResponse addSession(CreateSessionRequest request) {
        ClassEntity classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + request.getClassId()));

        LocalDate sessionDate = LocalDate.parse(request.getDate());
        LocalTime startTime = LocalTime.parse(request.getStartTime());
        LocalTime endTime = LocalTime.parse(request.getEndTime());

        checkTeacherSessionConflict(
                classEntity.getTeacher().getId(), 
                classEntity.getTeacher().getUser().getName(), 
                sessionDate, 
                startTime, 
                endTime, 
                null
        );

        ClassSession session = new ClassSession();
        session.setClassEntity(classEntity);
        session.setDate(sessionDate);
        session.setStartTime(startTime);
        session.setEndTime(endTime);
        session.setStatus(SessionStatus.upcoming);
        session.setType("extra".equals(request.getType()) ? SessionType.extra : SessionType.makeup);
        session.setNotes(request.getNotes());

        session = sessionRepository.save(session);
        return sessionMapper.toResponse(session);
    }

    @Override
    @Transactional
    public ClassSessionResponse updateSession(Long id, UpdateSessionRequest request) {
        ClassSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + id));

        LocalDate newDate = request.getDate() != null ? LocalDate.parse(request.getDate()) : session.getDate();
        LocalTime newStart = request.getStartTime() != null ? LocalTime.parse(request.getStartTime()) : session.getStartTime();
        LocalTime newEnd = request.getEndTime() != null ? LocalTime.parse(request.getEndTime()) : session.getEndTime();

        // Check if date or time changed
        if (request.getDate() != null || request.getStartTime() != null || request.getEndTime() != null) {
            checkTeacherSessionConflict(
                    session.getClassEntity().getTeacher().getId(),
                    session.getClassEntity().getTeacher().getUser().getName(),
                    newDate,
                    newStart,
                    newEnd,
                    id
            );
        }

        if (request.getDate() != null) {
            session.setDate(newDate);
        }
        if (request.getStartTime() != null) {
            session.setStartTime(newStart);
        }
        if (request.getEndTime() != null) {
            session.setEndTime(newEnd);
        }
        if (request.getType() != null) {
            session.setType("extra".equals(request.getType()) ? SessionType.extra : SessionType.makeup);
        }
        if (request.getNotes() != null) {
            session.setNotes(request.getNotes());
        }
        if (request.getRoomId() != null) {
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + request.getRoomId()));
            session.setRoomOverride(room);
        }

        session = sessionRepository.save(session);
        return sessionMapper.toResponse(session);
    }

    @Override
    @Transactional
    public void extendActiveClassSessions() {
        List<ClassEntity> activeClasses = classRepository.findByStatus(ClassStatus.active);
        LocalDate today = LocalDate.now();
        int extended = 0;

        for (ClassEntity c : activeClasses) {
            if (c.getSchedule() == null || c.getSchedule().isBlank()) continue;
            if (c.getEndDate() != null) continue; // lớp có endDate cố định → không extend

            long futureCount = sessionRepository
                    .countByClassEntityIdAndDateGreaterThanAndStatusNot(
                            c.getId(), today, SessionStatus.cancelled);

            if (futureCount < 14) {
                generateSessionsForClass(c, today, today.plusMonths(1));
                extended++;
                log.info("Auto-extended sessions for class '{}' (id={}), had {} future sessions",
                        c.getName(), c.getId(), futureCount);
            }
        }

        if (extended > 0) {
            log.info("Auto-extended sessions for {} classes", extended);
        }
    }

    @Override
    @Transactional
    public void deleteSession(Long id) {
        ClassSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + id));
        sessionRepository.delete(session);
    }

    /**
     * Kiểm tra xung đột cho 1 buổi học cụ thể (add, update session)
     */
    private void checkTeacherSessionConflict(Long teacherId, String teacherName, LocalDate date, LocalTime newStart, LocalTime newEnd, Long excludeSessionId) {
        List<ClassSession> teacherSessions = sessionRepository.findByClassEntityTeacherIdAndDate(teacherId, date);
        for (ClassSession existing : teacherSessions) {
            if (existing.getStatus() == SessionStatus.cancelled) continue;
            if (excludeSessionId != null && existing.getId().equals(excludeSessionId)) continue;
            
            LocalTime existStart = existing.getStartTime();
            LocalTime existEnd = existing.getEndTime();
            
            if (newStart.isBefore(existEnd) && newEnd.isAfter(existStart)) {
                throw new com.meilearning.backend.exception.BusinessException(
                        String.format("Giáo viên \"%s\" đã có lịch dạy lớp \"%s\" từ %s đến %s ngày %s. Không thể xếp lịch trùng.",
                                teacherName, existing.getClassEntity().getName(),
                                existStart.toString(), existEnd.toString(), date.toString()));
            }
        }
    }

}
