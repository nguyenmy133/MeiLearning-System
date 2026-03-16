package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
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
import com.meilearning.backend.repository.ClassRepository;
import com.meilearning.backend.repository.RoomRepository;
import com.meilearning.backend.repository.SubjectRepository;
import com.meilearning.backend.repository.TeacherRepository;
import com.meilearning.backend.service.ClassService;
import java.time.LocalDate;
@Service
@RequiredArgsConstructor
@Transactional
public class ClassServiceImpl implements ClassService {

    private final ClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final RoomRepository roomRepository;
    private final ClassMapper classMapper;

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

                    cb.like(cb.lower(root.get("name")), keyword));

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

        ClassEntity entity = ClassEntity.builder()
                .name(request.getName())
                .subject(subject)
                .teacher(teacher)
                .maxStudents(request.getMaxStudents())
                .pricePerSession(request.getPricePerSession())
                .schedule(classMapper.scheduleToJson(request.getSchedule()))
                .startDate(request.getStartDate() != null ? LocalDate.parse(request.getStartDate()) : LocalDate.now())
                .description(request.getDescription())
                .build();

        // Optionally link room

        if (request.getRoom() != null && !request.getRoom().isBlank()) {
            Room room = roomRepository.findByName(request.getRoom())
                    .orElse(null);

            entity.setRoom(room);

        }

        entity = classRepository.save(entity);

        return classMapper.toResponse(entity);

    }

    @Override
    public ClassResponse update(Long id, UpdateClassRequest request) {

        ClassEntity entity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp với id: " + id));

        if (request.getName() != null) entity.setName(request.getName());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        if (request.getMaxStudents() != null) entity.setMaxStudents(request.getMaxStudents());
        if (request.getPricePerSession() != null) entity.setPricePerSession(request.getPricePerSession());
        if (request.getStartDate() != null) entity.setStartDate(LocalDate.parse(request.getStartDate()));
        if (request.getStatus() != null) entity.setStatus(request.getStatus());
        if (request.getSubject() != null) {
            Subject subject = subjectRepository.findByNameIgnoreCase(request.getSubject())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học: " + request.getSubject()));

            entity.setSubject(subject);

        }

        if (request.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giáo viên: " + request.getTeacherId()));

            entity.setTeacher(teacher);

        }

        if (request.getSchedule() != null) {
            entity.setSchedule(classMapper.scheduleToJson(request.getSchedule()));

        }

        entity = classRepository.save(entity);

        return classMapper.toResponse(entity);

    }

    @Override
    public void delete(Long id) {

        ClassEntity entity = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp với id: " + id));

        if (entity.getStatus() == ClassStatus.active) {
            throw new BusinessException("Không thể xóa lớp đang hoạt động. Hãy kết thúc lớp trước.");

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

        entity.setStatus(ClassStatus.completed);
        entity.setEndDate(LocalDate.now());

        classRepository.save(entity);

    }

    @Override
    @Transactional(readOnly = true)
    public ClassStatsResponse getStats() {

        return ClassStatsResponse.builder()
                .totalClasses(classRepository.count())
                .activeClasses(classRepository.countByStatus(ClassStatus.active))
                .upcomingClasses(classRepository.countByStatus(ClassStatus.upcoming))
                .totalStudents(classRepository.countTotalStudentsInActiveClasses())
                .build();

    }

}
