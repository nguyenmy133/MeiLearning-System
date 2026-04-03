package com.meilearning.backend.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.request.CreateClassRequest;
import com.meilearning.backend.dto.request.UpdateClassRequest;
import com.meilearning.backend.dto.response.ClassResponse;
import com.meilearning.backend.dto.response.ClassStatsResponse;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.util.SpecHelper;
import com.meilearning.backend.entity.ClassEntity;
import com.meilearning.backend.entity.Room;
import com.meilearning.backend.entity.Subject;
import com.meilearning.backend.entity.Teacher;
import com.meilearning.backend.entity.enums.ClassStatus;
import com.meilearning.backend.exception.BusinessException;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.mapper.ClassMapper;
import com.meilearning.backend.repository.ClassEnrollmentRepository;
import com.meilearning.backend.repository.ClassRepository;
import com.meilearning.backend.repository.ClassSessionRepository;
import com.meilearning.backend.repository.RoomRepository;
import com.meilearning.backend.repository.SubjectRepository;
import com.meilearning.backend.repository.TeacherRepository;
import com.meilearning.backend.service.ClassService;
import com.meilearning.backend.service.ScheduleService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ClassServiceImpl implements ClassService {

    private final ClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final RoomRepository roomRepository;
    private final ClassEnrollmentRepository enrollmentRepository;
    private final ClassSessionRepository sessionRepository;
    private final ClassMapper classMapper;
    private final ScheduleService scheduleService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ClassResponse> getAll(String search, String subject, String facility,
                                               String status, Long teacherId, int page, int limit) {

        if (page < 1) page = 1;
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());

        Specification<ClassEntity> spec = SpecHelper.empty();

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("name")), keyword),
                            cb.like(cb.lower(root.get("teacher").get("user").get("name")), keyword)
                    ));
        }

        if (subject != null && !subject.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("subject").get("name")), "%" + subject.toLowerCase() + "%"));
        }

        if (facility != null && !facility.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("room").get("facility").get("name")),
                            "%" + facility.toLowerCase() + "%"));
        }

        if (status != null && !status.isBlank() && !"all".equals(status)) {
            ClassStatus classStatus = ClassStatus.valueOf(status);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), classStatus));
        }

        if (teacherId != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("teacher").get("id"), teacherId));
        }

        Page<ClassEntity> result = classRepository.findAll(spec, pageable);

        return PageResponse.<ClassResponse>builder()
                .data(result.getContent().stream().map(classMapper::toResponse).toList())
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(result.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ClassResponse getById(Long id) {
        ClassEntity entity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp với id: " + id));
        return classMapper.toResponse(entity);
    }

    @Override
    public ClassResponse create(CreateClassRequest request) {

        Subject subject = subjectRepository.findByNameIgnoreCase(request.getSubject())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học: " + request.getSubject()));

        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giáo viên: " + request.getTeacherId()));

        if (teacher.getStatus() == com.meilearning.backend.entity.enums.TeacherStatus.locked) {
            throw new BusinessException(
                    "Không thể gán lớp cho giáo viên \"" + teacher.getUser().getName()
                    + "\" — tài khoản đang bị khóa.");
        }

        LocalDate startDate = request.getStartDate() != null
                ? LocalDate.parse(request.getStartDate())
                : LocalDate.now();

        // Không cho tạo lớp với ngày bắt đầu trong quá khứ
        if (startDate.isBefore(LocalDate.now())) {
            throw new BusinessException("Ngày bắt đầu không được nằm trong quá khứ.");
        }

        // Auto-set status: hôm nay → active, tương lai → upcoming
        ClassStatus initialStatus = startDate.isEqual(LocalDate.now())
                ? ClassStatus.active
                : ClassStatus.upcoming;

        // ── Kiểm tra xung đột phòng ──
        Room room = null;
        if (request.getRoom() != null && !request.getRoom().isBlank()) {
            room = (request.getFacility() != null && !request.getFacility().isBlank())
                    ? roomRepository.findByNameAndFacilityName(request.getRoom(), request.getFacility()).orElse(null)
                    : roomRepository.findByName(request.getRoom()).orElse(null);
            if (room != null) {
                // Validate sĩ số không vượt sức chứa phòng
                if (request.getMaxStudents() > room.getCapacity()) {
                    throw new BusinessException(
                            String.format("Sĩ số tối đa (%d) không được vượt sức chứa phòng \"%s\" (%d chỗ).",
                                    request.getMaxStudents(), room.getName(), room.getCapacity()));
                }
                if (request.getSchedule() != null && !request.getSchedule().isEmpty()) {
                    checkRoomScheduleConflict(room, request.getSchedule(), null);
                }
            }
        }

        ClassEntity entity = ClassEntity.builder()
                .name(request.getName())
                .subject(subject)
                .teacher(teacher)
                .maxStudents(request.getMaxStudents())
                .pricePerSession(request.getPricePerSession())
                .schedule(classMapper.scheduleToJson(request.getSchedule()))
                .startDate(startDate)
                .description(request.getDescription())
                .status(initialStatus)
                .build();

        if (room != null) {
            entity.setRoom(room);
        }

        entity = classRepository.save(entity);

        // Auto-generate sessions from schedule
        try {
            scheduleService.generateSessions(entity.getId());
        } catch (Exception e) {
            log.error("Lớp '{}' đã tạo nhưng không thể generate sessions: {}", entity.getName(), e.getMessage(), e);
        }

        return classMapper.toResponse(entity);
    }

    @Override
    public ClassResponse update(Long id, UpdateClassRequest request) {

        ClassEntity entity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp với id: " + id));

        // Lớp completed → không cho chỉnh sửa (dữ liệu lịch sử)
        if (entity.getStatus() == ClassStatus.completed) {
            throw new BusinessException("Không thể chỉnh sửa lớp đã kết thúc. Dữ liệu lịch sử cần được giữ nguyên.");
        }

        // ── Cập nhật các field thông thường ──
        if (request.getName() != null) entity.setName(request.getName());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        if (request.getMaxStudents() != null) entity.setMaxStudents(request.getMaxStudents());
        if (request.getPricePerSession() != null) entity.setPricePerSession(request.getPricePerSession());

        if (request.getSubject() != null) {
            Subject subject = subjectRepository.findByNameIgnoreCase(request.getSubject())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học: " + request.getSubject()));
            entity.setSubject(subject);
        }

        if (request.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giáo viên: " + request.getTeacherId()));

            if (teacher.getStatus() == com.meilearning.backend.entity.enums.TeacherStatus.locked) {
                throw new BusinessException(
                        "Không thể gán lớp cho giáo viên \"" + teacher.getUser().getName()
                        + "\" — tài khoản đang bị khóa.");
            }
            entity.setTeacher(teacher);
        }

        if (request.getSchedule() != null) {
            entity.setSchedule(classMapper.scheduleToJson(request.getSchedule()));
        }

        // ── Kiểm tra xung đột phòng khi đổi phòng hoặc đổi schedule ──
        if (request.getRoom() != null && !request.getRoom().isBlank()) {
            String facilityName = (request.getFacility() != null && !request.getFacility().isBlank())
                    ? request.getFacility()
                    : (entity.getRoom() != null ? entity.getRoom().getFacility().getName() : null);
            Room room = (facilityName != null)
                    ? roomRepository.findByNameAndFacilityName(request.getRoom(), facilityName).orElse(null)
                    : roomRepository.findByName(request.getRoom()).orElse(null);
            if (room != null) {
                // Validate sĩ số không vượt sức chứa phòng
                int effectiveMaxStudents = request.getMaxStudents() != null
                        ? request.getMaxStudents()
                        : entity.getMaxStudents();
                if (effectiveMaxStudents > room.getCapacity()) {
                    throw new BusinessException(
                            String.format("Sĩ số tối đa (%d) không được vượt sức chứa phòng \"%s\" (%d chỗ).",
                                    effectiveMaxStudents, room.getName(), room.getCapacity()));
                }
                // Kiểm tra xung đột lịch học
                List<CreateClassRequest.SessionSlotDTO> scheduleToCheck;
                if (request.getSchedule() != null) {
                    scheduleToCheck = request.getSchedule();
                } else {
                    scheduleToCheck = parseScheduleToSlots(entity.getSchedule());
                }
                if (scheduleToCheck != null && !scheduleToCheck.isEmpty()) {
                    checkRoomScheduleConflict(room, scheduleToCheck, id);
                }
            }
            entity.setRoom(room);
        }

        // ── Xử lý startDate + status liên kết ──
        if (request.getStartDate() != null) {
            LocalDate newStartDate = LocalDate.parse(request.getStartDate());
            entity.setStartDate(newStartDate);

            // Auto-recalculate status dựa trên startDate mới
            if (entity.getStatus() == ClassStatus.upcoming) {
                if (!newStartDate.isAfter(LocalDate.now())) {
                    entity.setStatus(ClassStatus.active);
                }
            }
        }

        // Status được tự động quản lý bởi ClassStatusScheduler
        // Không cho phép thay đổi status thủ công qua update API

        entity = classRepository.save(entity);
        return classMapper.toResponse(entity);
    }

    @Override
    public void delete(Long id) {

        ClassEntity entity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp với id: " + id));

        // Chỉ cho xóa lớp "upcoming" (chưa bắt đầu, chưa có dữ liệu)
        if (entity.getStatus() == ClassStatus.active) {
            throw new BusinessException("Không thể xóa lớp đang hoạt động. Hãy kết thúc lớp trước.");
        }
        if (entity.getStatus() == ClassStatus.completed) {
            throw new BusinessException("Không thể xóa lớp đã kết thúc. Dữ liệu lịch sử cần được giữ lại.");
        }

        // Xóa dữ liệu con trước (cascade thủ công vì entity không dùng CascadeType.REMOVE)
        if (entity.getSessions() != null && !entity.getSessions().isEmpty()) {
            entity.getSessions().clear();
        }
        if (entity.getEnrollments() != null && !entity.getEnrollments().isEmpty()) {
            entity.getEnrollments().clear();
        }

        classRepository.delete(entity);
    }

    @Override
    public void endClass(Long id) {

        ClassEntity entity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp với id: " + id));

        if (entity.getStatus() == ClassStatus.completed) {
            throw new BusinessException("Lớp đã kết thúc rồi.");
        }
        if (entity.getStatus() == ClassStatus.upcoming) {
            throw new BusinessException("Không thể kết thúc lớp chưa bắt đầu. Hãy hủy lớp hoặc chờ lớp bắt đầu.");
        }

        entity.setStatus(ClassStatus.completed);
        entity.setEndDate(LocalDate.now());
        classRepository.save(entity);

        // Cancel tất cả sessions tương lai
        List<com.meilearning.backend.entity.ClassSession> futureSessions = sessionRepository
                .findByClassEntityIdAndDateAfter(id, LocalDate.now());
        for (var s : futureSessions) {
            if (s.getStatus() == com.meilearning.backend.entity.enums.SessionStatus.upcoming) {
                s.setStatus(com.meilearning.backend.entity.enums.SessionStatus.cancelled);
            }
        }
        if (!futureSessions.isEmpty()) {
            sessionRepository.saveAll(futureSessions);
            log.info("Cancelled {} future sessions for class '{}'", futureSessions.size(), entity.getName());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ClassStatsResponse getStats() {
        return ClassStatsResponse.builder()
                .totalClasses(classRepository.count())
                .activeClasses(classRepository.countByStatus(ClassStatus.active))
                .completedClasses(classRepository.countByStatus(ClassStatus.completed))
                .upcomingClasses(classRepository.countByStatus(ClassStatus.upcoming))
                .build();
    }

    // ── PRIVATE HELPERS ──────────────────────────────────────────────────────

    /**
     * Kiểm tra xung đột lịch học trong cùng 1 phòng.
     * Xung đột xảy ra khi: cùng phòng + cùng thứ + khung giờ chồng nhau
     * + lớp đang active/upcoming.
     *
     * @param room      phòng cần kiểm tra
     * @param newSlots  lịch học mới
     * @param excludeId ID lớp cần loại trừ (khi update chính nó), null nếu create
     */
    private void checkRoomScheduleConflict(Room room, List<CreateClassRequest.SessionSlotDTO> newSlots, Long excludeId) {
        List<ClassEntity> existingClasses = classRepository.findActiveOrUpcomingByRoomId(room.getId());

        for (ClassEntity existing : existingClasses) {
            // Loại trừ chính lớp đang update
            if (excludeId != null && existing.getId().equals(excludeId)) continue;

            List<Map<String, Object>> existingSlots = parseScheduleJson(existing.getSchedule());
            if (existingSlots.isEmpty()) continue;

            for (CreateClassRequest.SessionSlotDTO newSlot : newSlots) {
                for (Map<String, Object> existingSlot : existingSlots) {
                    int existingWeekday = ((Number) existingSlot.get("weekday")).intValue();

                    if (existingWeekday == newSlot.getWeekday()) {
                        // Cùng thứ → kiểm tra giờ chồng nhau
                        LocalTime existStart = LocalTime.parse((String) existingSlot.get("startTime"));
                        LocalTime existEnd = LocalTime.parse((String) existingSlot.get("endTime"));
                        LocalTime newStart = LocalTime.parse(newSlot.getStartTime());
                        LocalTime newEnd = LocalTime.parse(newSlot.getEndTime());

                        // Chồng nhau nếu: newStart < existEnd AND newEnd > existStart
                        if (newStart.isBefore(existEnd) && newEnd.isAfter(existStart)) {
                            String dayLabel = getDayLabel(newSlot.getWeekday());
                            throw new BusinessException(
                                    String.format("Phòng \"%s\" đã có lớp \"%s\" vào %s (%s–%s). Vui lòng chọn phòng hoặc giờ khác.",
                                            room.getName(), existing.getName(), dayLabel,
                                            existStart.toString(), existEnd.toString()));
                        }
                    }
                }
            }
        }
    }

    /** Parse schedule JSON string → List<Map> */
    private List<Map<String, Object>> parseScheduleJson(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    /** Parse schedule JSON string → List<SessionSlotDTO> (cho update khi không gửi schedule mới) */
    private List<CreateClassRequest.SessionSlotDTO> parseScheduleToSlots(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private String getDayLabel(int weekday) {
        return switch (weekday) {
            case 0 -> "Chủ nhật";
            case 1 -> "Thứ 2";
            case 2 -> "Thứ 3";
            case 3 -> "Thứ 4";
            case 4 -> "Thứ 5";
            case 5 -> "Thứ 6";
            case 6 -> "Thứ 7";
            default -> "?";
        };
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEnrolledStudents(Long classId) {
        classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp: " + classId));

        return enrollmentRepository.findByClassEntityId(classId).stream().map(e -> {
            var student = e.getStudent();
            var user = student.getUser();
            Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id", student.getId());
            map.put("name", user.getName());
            map.put("phone", user.getPhone());
            map.put("email", user.getEmail());
            map.put("gender", student.getGender() != null ? student.getGender().name() : null);
            map.put("status", student.getStatus().name());
            map.put("enrolledAt", e.getEnrolledAt() != null ? e.getEnrolledAt().toString() : null);
            return map;
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassResponse> getEnrolledClassesByStudent(Long studentId) {
        // Bug fix: getById() per enrollment → N+1 queries (50 enrollments = 51 queries)
        // Fix: map trực tiếp từ ClassEntity đã được fetch trong enrollment join
        return enrollmentRepository.findByStudentId(studentId)
                .stream()
                .map(enrollment -> classMapper.toResponse(enrollment.getClassEntity()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getClassmates(Long classId, Long currentStudentId) {
        if (!enrollmentRepository.existsByStudentIdAndClassEntityId(currentStudentId, classId)) {
            throw new com.meilearning.backend.exception.BusinessException("Bạn không thuộc lớp này");
        }
        return enrollmentRepository.findByClassEntityId(classId).stream()
                .map(e -> {
                    Map<String, Object> map = new java.util.LinkedHashMap<>();
                    map.put("id", e.getStudent().getId());
                    map.put("name", e.getStudent().getUser().getName());
                    return map;
                }).toList();
    }
}
