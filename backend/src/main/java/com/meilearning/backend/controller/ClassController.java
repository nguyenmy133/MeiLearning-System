package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.meilearning.backend.dto.request.CreateClassRequest;
import com.meilearning.backend.dto.request.UpdateClassRequest;
import com.meilearning.backend.dto.response.ClassResponse;
import com.meilearning.backend.dto.response.ClassStatsResponse;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.repository.ClassEnrollmentRepository;
import com.meilearning.backend.repository.StudentRepository;
import com.meilearning.backend.repository.TeacherRepository;
import com.meilearning.backend.entity.Student;
import com.meilearning.backend.service.ClassService;
import com.meilearning.backend.util.SecurityUtils;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
@Tag(name = "Class", description = "Quản lý lớp học")
@PreAuthorize("hasAnyRole('admin', 'teacher')")
public class ClassController {

    private final ClassService classService;
    private final TeacherRepository teacherRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository;
    private final StudentRepository studentRepository;

    @GetMapping
    @Operation(summary = "Lấy danh sách lớp học")
    public ResponseEntity<PageResponse<ClassResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String facility,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        // Teacher chỉ xem lớp mình dạy — auto-filter teacherId
        Long resolvedTeacherId = resolveTeacherIdIfNeeded(teacherId);

        return ResponseEntity.ok(classService.getAll(search, subject, facility, status, resolvedTeacherId, page, limit));
    }


    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết lớp học")
    public ResponseEntity<ClassResponse> getById(@PathVariable Long id) {

        return ResponseEntity.ok(classService.getById(id));

    }



    @PostMapping
    @Operation(summary = "Tạo lớp học mới (Admin)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ClassResponse> create(@Valid @RequestBody CreateClassRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(classService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật lớp học")
    public ResponseEntity<ClassResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody UpdateClassRequest request) {
        return ResponseEntity.ok(classService.update(id, request));

    }


    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa lớp học (Admin, phải không active)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classService.delete(id);
        return ResponseEntity.noContent().build();
    }


    @PatchMapping("/{id}/end")
    @Operation(summary = "Kết thúc lớp học (Admin)")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> endClass(@PathVariable Long id) {
        classService.endClass(id);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/{id}/students")
    @Operation(summary = "Lấy danh sách học viên đã đăng ký lớp")
    public ResponseEntity<?> getEnrolledStudents(@PathVariable Long id) {
        return ResponseEntity.ok(classService.getEnrolledStudents(id));
    }

    @GetMapping("/stats")
    @Operation(summary = "Lấy thống kê lớp học")
    public ResponseEntity<ClassStatsResponse> getStats() {
        return ResponseEntity.ok(classService.getStats());
    }

    /**
     * Lấy danh sách lớp mà student đang đăng nhập đã enroll.
     * Resolve student từ JWT — không cần FE truyền studentId.
     */
    @GetMapping("/enrolled/me")
    @Operation(summary = "Lấy lớp đã đăng ký của học viên (JWT)")
    @PreAuthorize("hasRole('student')")
    public ResponseEntity<List<ClassResponse>> getMyEnrolledClasses(Principal principal) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository);
        List<ClassResponse> classes = classEnrollmentRepository.findByStudentId(student.getId())
                .stream()
                .map(enrollment -> classService.getById(enrollment.getClassEntity().getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(classes);
    }

    /**
     * Student xem danh sách bạn cùng lớp (chỉ trả tên, không trả SĐT/email — privacy).
     * Chỉ cho phép nếu student đã enroll lớp đó.
     */
    @GetMapping("/{id}/classmates")
    @Operation(summary = "Lấy danh sách bạn cùng lớp (student, chỉ tên)")
    @PreAuthorize("hasRole('student')")
    public ResponseEntity<?> getClassmates(@PathVariable Long id) {
        Student me = SecurityUtils.getCurrentStudent(studentRepository);
        if (!classEnrollmentRepository.existsByStudentIdAndClassEntityId(me.getId(), id)) {
            return ResponseEntity.status(403).body("Bạn không thuộc lớp này");
        }
        List<Map<String, Object>> classmates = classEnrollmentRepository.findByClassEntityId(id).stream()
                .map(e -> {
                    Map<String, Object> map = new java.util.LinkedHashMap<>();
                    map.put("id", e.getStudent().getId());
                    map.put("name", e.getStudent().getUser().getName());
                    return map;
                }).toList();
        return ResponseEntity.ok(classmates);
    }


    // ── Helper: resolve teacherId cho teacher role ──────────────────────────

    /**
     * Nếu user hiện tại là teacher → tự động lấy teacherId của họ.
     * Admin có thể truyền bất kỳ teacherId hoặc null (xem tất cả).
     */
    private Long resolveTeacherIdIfNeeded(Long requestedTeacherId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return requestedTeacherId;

        boolean isTeacher = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_teacher"));
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_admin"));

        if (isTeacher && !isAdmin) {
            // Teacher → bắt buộc filter theo teacherId của chính mình
            String username = auth.getName();
            return teacherRepository.findByUserUsername(username)
                    .map(t -> t.getId())
                    .orElse(requestedTeacherId);
        }

        // Admin → dùng teacherId từ request (hoặc null = xem tất cả)
        return requestedTeacherId;
    }
}
