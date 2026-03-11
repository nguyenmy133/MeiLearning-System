package meilearning.com.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import meilearning.com.backend.dto.request.CreateTeacherRequest;
import meilearning.com.backend.dto.request.UpdateTeacherRequest;
import meilearning.com.backend.dto.response.PageResponse;
import meilearning.com.backend.dto.response.TeacherResponse;
import meilearning.com.backend.dto.response.TeacherStatsResponse;
import meilearning.com.backend.entity.Subject;
import meilearning.com.backend.entity.Teacher;
import meilearning.com.backend.entity.User;
import meilearning.com.backend.entity.enums.TeacherStatus;
import meilearning.com.backend.exception.BusinessException;
import meilearning.com.backend.exception.DuplicateResourceException;
import meilearning.com.backend.exception.ResourceNotFoundException;
import meilearning.com.backend.mapper.TeacherMapper;
import meilearning.com.backend.repository.SubjectRepository;
import meilearning.com.backend.repository.TeacherRepository;
import meilearning.com.backend.repository.UserRepository;
import meilearning.com.backend.service.TeacherService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherMapper teacherMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TeacherResponse> getAll(String search, String subject, String status,
                                                 int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Specification<Teacher> spec = Specification.where((Specification<Teacher>) null);

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
            List<Subject> subjects = request.getSubjects().stream()
                    .map(name -> subjectRepository.findByNameIgnoreCase(name)
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học: " + name)))
                    .toList();
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

        teacherMapper.updateEntity(request, teacher);

        // Update subjects if provided
        if (request.getSubjects() != null) {
            List<Subject> subjects = request.getSubjects().stream()
                    .map(name -> subjectRepository.findByNameIgnoreCase(name)
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học: " + name)))
                    .toList();
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

        teacherRepository.delete(teacher);
    }

    @Override
    public void resetPassword(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giáo viên với id: " + id));

        // Generate random password
        String newPassword = UUID.randomUUID().toString().substring(0, 8);
        teacher.getUser().setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(teacher.getUser());
        // TODO: Send new password via email/SMS
    }

    @Override
    public void lockAccount(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giáo viên với id: " + id));
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
                .totalClasses(0) // TODO: aggregate from ClassEntity
                .totalSubjects(subjectRepository.count())
                .build();
    }
}
