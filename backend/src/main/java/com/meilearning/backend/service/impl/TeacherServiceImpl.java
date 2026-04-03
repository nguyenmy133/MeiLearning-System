package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.request.CreateTeacherRequest;
import com.meilearning.backend.dto.request.UpdateTeacherRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.TeacherResponse;
import com.meilearning.backend.dto.response.TeacherStatsResponse;
import com.meilearning.backend.entity.Subject;
import com.meilearning.backend.util.SpecHelper;
import com.meilearning.backend.entity.Teacher;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.entity.enums.TeacherStatus;
import com.meilearning.backend.exception.BusinessException;
import com.meilearning.backend.exception.DuplicateResourceException;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.mapper.TeacherMapper;
import com.meilearning.backend.repository.ClassRepository;
import com.meilearning.backend.repository.ClassSessionRepository;
import com.meilearning.backend.repository.LeaveRequestRepository;
import com.meilearning.backend.repository.SubjectRepository;
import com.meilearning.backend.repository.TeacherRepository;
import com.meilearning.backend.repository.UserRepository;
import com.meilearning.backend.service.TeacherService;
import com.meilearning.backend.dto.response.PendingTaskResponse;
import com.meilearning.backend.entity.enums.RequestStatus;
import com.meilearning.backend.entity.enums.RequesterType;
import com.meilearning.backend.entity.enums.SessionStatus;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
@Service
@RequiredArgsConstructor
@Transactional
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final ClassRepository classRepository;
    private final ClassSessionRepository sessionRepository;
    private final LeaveRequestRepository leaveRepository;
    private final TeacherMapper teacherMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TeacherResponse> getAll(String search, String subject, String status,
                                                 int page, int limit) {

        if (page < 1) page = 1;
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());

        Specification<Teacher> spec = SpecHelper.empty();

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.toLowerCase() + "%";

            spec = spec.and((root, query, cb) ->

                    cb.or(

                            cb.like(cb.lower(root.get("user").get("name")), keyword),
                            cb.like(cb.lower(root.get("user").get("email")), keyword),
                            cb.like(cb.lower(root.get("user").get("phone")), keyword)

                    ));

        }

        if (subject != null && !subject.isBlank()) {
            spec = spec.and((root, query, cb) ->

                    cb.like(cb.lower(root.join("subjects").get("name")), "%" + subject.toLowerCase() + "%"));

        }

        if (status != null && !status.isBlank() && !"all".equals(status)) {
            TeacherStatus teacherStatus = TeacherStatus.valueOf(status);

            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), teacherStatus));

        }

        Page<Teacher> result = teacherRepository.findAll(spec, pageable);

        return PageResponse.<TeacherResponse>builder()

                .data(result.getContent().stream().map(teacherMapper::toResponse).toList())
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(result.getTotalPages())
                .build();

    }

    @Override
    @Transactional(readOnly = true)
    public TeacherResponse getById(Long id) {

        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giáo viên với id: " + id));

        return teacherMapper.toResponse(teacher);

    }

    @Override
    public TeacherResponse create(CreateTeacherRequest request) {

        // Validate unique username & email

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Tên đăng nhập '" + request.getUsername() + "' đã tồn tại");

        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' đã tồn tại");

        }
        
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Số điện thoại '" + request.getPhone() + "' gốc đã tồn tại");
        }

        // 1. Auto-create User account

        User user = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(User.Role.teacher)
                .active(true)
                .build();

        user = userRepository.save(user);

        // 2. Create Teacher profile

        Teacher teacher = Teacher.builder()
                .user(user)
                .dateOfBirth(request.getDateOfBirth() != null ? LocalDate.parse(request.getDateOfBirth()) : null)
                .gender(request.getGender())
                .address(request.getAddress())
                .bio(request.getBio())
                .joinDate(LocalDate.now())
                .build();

        // 3. Link subjects by name

        if (request.getSubjects() != null && !request.getSubjects().isEmpty()) {
            List<Subject> subjects = new ArrayList<>(request.getSubjects().stream()
                    .map(name -> subjectRepository.findByNameIgnoreCase(name)
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học: " + name)))
                    .toList());

            teacher.setSubjects(subjects);

        }

        teacher = teacherRepository.save(teacher);

        return teacherMapper.toResponse(teacher);

    }

    @Override
    public TeacherResponse update(Long id, UpdateTeacherRequest request) {

        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giáo viên với id: " + id));

        // Validate unique email if changing

        if (request.getEmail() != null && !request.getEmail().equals(teacher.getUser().getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email '" + request.getEmail() + "' đã tồn tại");

            }

        }
        
        if (request.getPhone() != null && !request.getPhone().equals(teacher.getUser().getPhone())) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new DuplicateResourceException("Số điện thoại '" + request.getPhone() + "' gốc đã tồn tại");
            }
        }

        teacherMapper.updateEntity(request, teacher);

        // Update subjects if provided

        if (request.getSubjects() != null) {
            List<Subject> subjects = new ArrayList<>(request.getSubjects().stream()
                    .map(name -> subjectRepository.findByNameIgnoreCase(name)
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học: " + name)))
                    .toList());

            teacher.setSubjects(subjects);

        }

        userRepository.save(teacher.getUser());

        teacher = teacherRepository.save(teacher);

        return teacherMapper.toResponse(teacher);

    }

    @Override
    public void delete(Long id) {

        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giáo viên với id: " + id));

        if (teacher.getClasses() != null && !teacher.getClasses().isEmpty()) {
            throw new BusinessException("Không thể xóa giáo viên đang phụ trách lớp. Hãy chuyển lớp trước.");

        }

        User user = teacher.getUser();

        teacherRepository.delete(teacher);

        userRepository.delete(user);

    }

    @Override
    public String resetPassword(Long id) {

        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giáo viên với id: " + id));

        // Generate random password

        String newPassword = UUID.randomUUID().toString().substring(0, 8);

        teacher.getUser().setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(teacher.getUser());

        return newPassword;

    }

    @Override
    public void lockAccount(Long id) {

        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giáo viên với id: " + id));

        // Không cho khóa giáo viên đang phụ trách lớp active/upcoming
        long activeClassCount = classRepository.countByTeacherIdAndStatusIn(
                id, List.of(com.meilearning.backend.entity.enums.ClassStatus.active,
                            com.meilearning.backend.entity.enums.ClassStatus.upcoming));
        if (activeClassCount > 0) {
            throw new BusinessException(
                    "Không thể khóa tài khoản giáo viên \"" + teacher.getUser().getName()
                    + "\" — đang phụ trách " + activeClassCount
                    + " lớp . Hãy chuyển lớp sang giáo viên khác trước.");
        }

        teacher.setStatus(TeacherStatus.locked);
        teacher.getUser().setActive(false);

        userRepository.save(teacher.getUser());

        teacherRepository.save(teacher);

    }

    @Override
    public void unlockAccount(Long id) {

        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giáo viên với id: " + id));

        teacher.setStatus(TeacherStatus.active);
        teacher.getUser().setActive(true);

        userRepository.save(teacher.getUser());

        teacherRepository.save(teacher);

    }

    @Override
    @Transactional(readOnly = true)
    public TeacherStatsResponse getStats() {

        return TeacherStatsResponse.builder()
                .totalTeachers(teacherRepository.count())
                .activeTeachers(teacherRepository.countByStatus(TeacherStatus.active))
                .totalClasses(classRepository.count())
                .totalSubjects(subjectRepository.count())
                .build();

    }

    @Override
    @Transactional(readOnly = true)
    public List<PendingTaskResponse> getMyPendingTasks(String username) {
        var teacherOpt = teacherRepository.findByUserUsername(username);
        if (teacherOpt.isEmpty()) return List.of();

        var teacher = teacherOpt.get();
        List<PendingTaskResponse> tasks = new ArrayList<>();

        // 1. Pending leave requests trong session của teacher
        var allSessions = sessionRepository.findByClassEntityTeacherId(teacher.getId());
        var sessionIds = allSessions.stream().map(s -> s.getId()).toList();
        if (!sessionIds.isEmpty()) {
            long pendingLeaves = leaveRepository.findBySessionIdIn(sessionIds)
                    .stream()
                    .filter(lr -> lr.getStatus() == RequestStatus.pending
                            && lr.getRequesterType() == RequesterType.student)
                    .count();
            if (pendingLeaves > 0) {
                tasks.add(PendingTaskResponse.builder()
                        .type("leave")
                        .title("Đơn xin nghỉ chưa duyệt")
                        .description(pendingLeaves + " đơn xin nghỉ của học viên đang chờ duyệt")
                        .count((int) pendingLeaves)
                        .urgent(true)
                        .build());
            }
        }

        // 2. Buổi học hôm nay chưa điểm danh
        LocalDate today = LocalDate.now();
        long undoneToday = sessionRepository
                .findByClassEntityTeacherIdAndDate(teacher.getId(), today)
                .stream()
                .filter(s -> s.getStatus() == SessionStatus.upcoming)
                .count();
        if (undoneToday > 0) {
            tasks.add(PendingTaskResponse.builder()
                    .type("attendance")
                    .title("Buổi học chưa điểm danh")
                    .description("Hôm nay có " + undoneToday + " buổi học chưa được điểm danh")
                    .count((int) undoneToday)
                    .urgent(false)
                    .build());
        }

        return tasks;
    }

}

