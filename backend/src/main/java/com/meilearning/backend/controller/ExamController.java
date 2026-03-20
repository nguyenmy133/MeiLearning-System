package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.meilearning.backend.dto.request.CreateExamRequest;
import com.meilearning.backend.dto.request.SubmitExamResultRequest;
import com.meilearning.backend.dto.request.UpdateExamRequest;
import com.meilearning.backend.dto.response.ExamResponse;
import com.meilearning.backend.dto.response.ExamResultResponse;
import com.meilearning.backend.dto.response.ExamStatisticsResponse;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.entity.Student;
import com.meilearning.backend.entity.Teacher;
import com.meilearning.backend.repository.StudentRepository;
import com.meilearning.backend.repository.TeacherRepository;
import com.meilearning.backend.service.ExamService;
import com.meilearning.backend.util.SecurityUtils;
import java.security.Principal;
import java.util.List;
@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
@Tag(name = "Exam", description = "Quản lý bài kiểm tra")
@PreAuthorize("hasAnyRole('admin', 'teacher', 'student')")
public class ExamController {

    private final ExamService examService;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

    @GetMapping
    @Operation(summary = "Danh sách bài kiểm tra")
    public ResponseEntity<PageResponse<ExamResponse>> getAll(
            Principal principal,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        // Teacher role: auto-filter theo teacher hiện tại (dùng teacher.id entity PK)
        Long resolvedTeacherId = teacherId;
        if (SecurityUtils.isTeacher() && !SecurityUtils.isAdmin()) {
            Teacher teacher = SecurityUtils.getCurrentTeacher(teacherRepository);
            resolvedTeacherId = teacher.getId();
        }
        return ResponseEntity.ok(examService.getAll(resolvedTeacherId, status, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết bài kiểm tra")
    public ResponseEntity<ExamResponse> getById(@PathVariable Long id) {

        return ResponseEntity.ok(examService.getById(id));

    }

    @PostMapping
    @Operation(summary = "Tạo bài kiểm tra (Teacher)")
    @PreAuthorize("hasAnyRole('admin', 'teacher')")
    public ResponseEntity<ExamResponse> create(
            Principal principal,
            @Valid @RequestBody CreateExamRequest request) {

        // Resolve teacher từ JWT — override bất kỳ teacherId FE truyền
        Teacher teacher = SecurityUtils.getCurrentTeacher(teacherRepository);
        request.setTeacherId(teacher.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.create(request));
    }

    @PatchMapping("/{id}/publish")
    @Operation(summary = "Publish bài kiểm tra")
    public ResponseEntity<ExamResponse> publish(@PathVariable Long id) {

        return ResponseEntity.ok(examService.publish(id));

    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật bài kiểm tra (Teacher)")
    @PreAuthorize("hasAnyRole('admin', 'teacher')")
    public ResponseEntity<ExamResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateExamRequest request) {
        return ResponseEntity.ok(examService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa bài kiểm tra")
    public ResponseEntity<Void> delete(@PathVariable Long id) {

        examService.delete(id);

        return ResponseEntity.noContent().build();

    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Nộp bài (Student)")
    @PreAuthorize("hasAnyRole('student')")
    public ResponseEntity<ExamResultResponse> submit(
            Principal principal,
            @PathVariable Long id,
            @Valid @RequestBody SubmitExamResultRequest request) {

        // Resolve student từ JWT — chống giả mạo studentId
        Student student = SecurityUtils.getCurrentStudent(studentRepository);
        request.setStudentId(student.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.submit(id, request));
    }

    @GetMapping("/{id}/results")
    @Operation(summary = "Kết quả bài kiểm tra (Teacher)")
    public ResponseEntity<List<ExamResultResponse>> getResults(@PathVariable Long id) {

        return ResponseEntity.ok(examService.getResults(id));

    }

    @GetMapping("/{id}/results/{studentId}")
    @Operation(summary = "Kết quả 1 học viên")
    public ResponseEntity<ExamResultResponse> getStudentResult(
            @PathVariable Long id,
            @PathVariable Long studentId) {
        return ResponseEntity.ok(examService.getStudentResult(id, studentId));
    }

    @GetMapping("/{id}/statistics")
    @Operation(summary = "Thống kê tổng hợp bài thi (Teacher)")
    public ResponseEntity<ExamStatisticsResponse> getStatistics(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getStatistics(id));
    }

    @PatchMapping("/{id}/archive")
    @Operation(summary = "Lưu trữ bài thi (Teacher)")
    public ResponseEntity<ExamResponse> archive(@PathVariable Long id) {
        return ResponseEntity.ok(examService.archive(id));
    }

}
