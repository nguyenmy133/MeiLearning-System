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
import com.meilearning.backend.dto.request.CreateStudentRequest;
import com.meilearning.backend.dto.request.DropStudentRequest;
import com.meilearning.backend.dto.request.UpdateStudentRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.StudentResponse;
import com.meilearning.backend.dto.response.StudentStatsResponse;
import com.meilearning.backend.entity.ClassEnrollment;
import com.meilearning.backend.entity.ClassEntity;
import com.meilearning.backend.util.SpecHelper;
import com.meilearning.backend.entity.Student;
import com.meilearning.backend.entity.User;
import com.meilearning.backend.entity.enums.StudentStatus;
import com.meilearning.backend.entity.enums.TuitionStatus;
import com.meilearning.backend.exception.BusinessException;
import com.meilearning.backend.exception.DuplicateResourceException;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.mapper.StudentMapper;
import com.meilearning.backend.repository.ClassEnrollmentRepository;
import com.meilearning.backend.repository.ClassRepository;
import com.meilearning.backend.repository.StudentRepository;
import com.meilearning.backend.repository.UserRepository;
import com.meilearning.backend.service.StudentService;
import java.time.LocalDate;
import java.util.UUID;
@Service
@RequiredArgsConstructor
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository;
    private final StudentMapper studentMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StudentResponse> getAll(String search, Long classId, String status,
                                                 String tuitionStatus, int page, int limit) {

        if (page < 1) page = 1;
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());

        Specification<Student> spec = SpecHelper.empty();

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.toLowerCase() + "%";

            spec = spec.and((root, query, cb) ->

                    cb.or(

                            cb.like(cb.lower(root.get("user").get("name")), keyword),
                            cb.like(cb.lower(root.get("user").get("email")), keyword),
                            cb.like(cb.lower(root.get("user").get("phone")), keyword)

                    ));

        }

        if (classId != null) {
            spec = spec.and((root, query, cb) ->

                    cb.equal(root.join("enrollments").get("classEntity").get("id"), classId));

        }

        if (status != null && !status.isBlank() && !"all".equals(status)) {
            StudentStatus studentStatus = StudentStatus.valueOf(status);

            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), studentStatus));

        }

        if (tuitionStatus != null && !tuitionStatus.isBlank() && !"all".equals(tuitionStatus)) {
            TuitionStatus tStatus = TuitionStatus.valueOf(tuitionStatus);

            spec = spec.and((root, query, cb) -> cb.equal(root.get("tuitionStatus"), tStatus));

        }

        Page<Student> result = studentRepository.findAll(spec, pageable);

        return PageResponse.<StudentResponse>builder()

                .data(result.getContent().stream().map(studentMapper::toResponse).toList())
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(result.getTotalPages())
                .build();

    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getById(Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên với id: " + id));

        return studentMapper.toResponse(student);

    }

    @Override
    public StudentResponse create(CreateStudentRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Tên đăng nhập '" + request.getUsername() + "' đã tồn tại");

        }

        // Chỉ check trùng email khi có nhập email
        String email = (request.getEmail() != null && !request.getEmail().isBlank())
                ? request.getEmail().trim() : null;

        if (email != null && userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email '" + email + "' đã tồn tại");

        }

        // 1. Create User account

        User user = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(User.Role.student)
                .active(true)
                .build();

        user = userRepository.save(user);

        // 2. Create Student profile

        Student student = Student.builder()
                .user(user)
                .parentPhone(request.getParentPhone())
                .dateOfBirth(request.getDateOfBirth() != null ? LocalDate.parse(request.getDateOfBirth()) : null)
                .gender(request.getGender())
                .grade(request.getGrade())
                .address(request.getAddress())
                .enrollDate(LocalDate.now())
                .build();

        student = studentRepository.save(student);

        // 3. Create ClassEnrollments

        if (request.getClasses() != null) {
            for (var ce : request.getClasses()) {
                ClassEntity classEntity = classRepository.findById(ce.getClassId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp: " + ce.getClassId()));

                // Không cho thêm học viên vào lớp đã hoàn thành
                if (classEntity.getStatus() == com.meilearning.backend.entity.enums.ClassStatus.completed) {
                    throw new BusinessException(
                            "Không thể thêm học viên vào lớp \"" + classEntity.getName() + "\" vì lớp đã kết thúc.");
                }

                ClassEnrollment enrollment = ClassEnrollment.builder()
                        .student(student)
                        .classEntity(classEntity)
                        .build();

                classEnrollmentRepository.save(enrollment);

            }

        }

        return studentMapper.toResponse(studentRepository.findById(student.getId()).orElseThrow());

    }

    @Override
    public StudentResponse update(Long id, UpdateStudentRequest request) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên với id: " + id));

        // Normalize email: blank → null
        String email = (request.getEmail() != null && !request.getEmail().isBlank())
                ? request.getEmail().trim() : null;

        if (email != null && !email.equals(student.getUser().getEmail())) {
            if (userRepository.existsByEmail(email)) {
                throw new DuplicateResourceException("Email '" + email + "' đã tồn tại");

            }

        }

        // Update User fields

        if (request.getName() != null) student.getUser().setName(request.getName());
        student.getUser().setEmail(email);
        if (request.getPhone() != null) student.getUser().setPhone(request.getPhone());
        if (request.getParentPhone() != null) student.setParentPhone(request.getParentPhone());
        if (request.getAddress() != null) student.setAddress(request.getAddress());
        if (request.getTuitionStatus() != null) student.setTuitionStatus(request.getTuitionStatus());
        userRepository.save(student.getUser());

        student = studentRepository.save(student);

        // Update ClassEnrollments: xóa cũ → tạo mới
        if (request.getClasses() != null) {
            // Xóa tất cả enrollment hiện tại
            classEnrollmentRepository.deleteAll(
                    classEnrollmentRepository.findByStudentId(student.getId())
            );
            classEnrollmentRepository.flush();

            // Tạo enrollment mới theo danh sách request
            for (var ce : request.getClasses()) {
                ClassEntity classEntity = classRepository.findById(ce.getClassId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp: " + ce.getClassId()));

                // Không cho thêm học viên vào lớp đã hoàn thành
                if (classEntity.getStatus() == com.meilearning.backend.entity.enums.ClassStatus.completed) {
                    throw new BusinessException(
                            "Không thể thêm học viên vào lớp \"" + classEntity.getName() + "\" vì lớp đã kết thúc.");
                }

                ClassEnrollment enrollment = ClassEnrollment.builder()
                        .student(student)
                        .classEntity(classEntity)
                        .build();

                classEnrollmentRepository.save(enrollment);
            }
        }

        // Re-fetch để response có enrollment mới nhất
        return studentMapper.toResponse(studentRepository.findById(student.getId()).orElseThrow());

    }

    @Override
    public void delete(Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên với id: " + id));

        if (student.getStatus() == StudentStatus.active) {
            throw new BusinessException("Không thể xóa học viên đang active. Hãy ghi nhận nghỉ học trước.");

        }

        studentRepository.delete(student);

    }

    @Override
    public void dropStudent(Long id, DropStudentRequest request) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên với id: " + id));

        student.setStatus(StudentStatus.inactive);
        student.setDropDate(LocalDate.parse(request.getDropDate()));
        student.setDropReason(request.getReason());
        student.setDropNotes(request.getNotes());

        // Lock user account

        student.getUser().setActive(false);

        userRepository.save(student.getUser());

        studentRepository.save(student);

    }

    @Override
    public void reactivateStudent(Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên với id: " + id));

        student.setStatus(StudentStatus.active);
        student.setTuitionStatus(TuitionStatus.pending);
        student.setDropDate(null);
        student.setDropReason(null);
        student.setDropNotes(null);

        // Reactivate user account

        student.getUser().setActive(true);

        userRepository.save(student.getUser());

        studentRepository.save(student);

    }

    @Override
    public String resetPassword(Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên với id: " + id));

        String newPassword = UUID.randomUUID().toString().substring(0, 8);

        student.getUser().setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(student.getUser());

        return newPassword;

    }

    @Override
    @Transactional(readOnly = true)
    public StudentStatsResponse getStats() {
        long total = studentRepository.count();
        long active = studentRepository.countByStatus(StudentStatus.active);
        long unpaid = studentRepository.countByTuitionStatus(TuitionStatus.pending)
                    + studentRepository.countByTuitionStatus(TuitionStatus.overdue);

        // First day of current month at 00:00 UTC
        java.time.Instant startOfMonth = java.time.YearMonth.now()
                .atDay(1).atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
        long newThisMonth = studentRepository.countCreatedSince(startOfMonth);

        return StudentStatsResponse.builder()
                .totalStudents(total)
                .activeStudents(active)
                .unpaidTuitionCount(unpaid)
                .newStudentsThisMonth(newThisMonth)
                .build();

    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkPhoneExists(String phone) {
        // username = phone number trong hệ thống
        return userRepository.existsByUsername(phone);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkEmailExists(String email) {
        if (email == null || email.isBlank()) return false;
        return userRepository.existsByEmail(email.trim());
    }

}
