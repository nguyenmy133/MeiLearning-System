package meilearning.com.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import meilearning.com.backend.dto.request.CreateExamRequest;
import meilearning.com.backend.dto.request.SubmitExamResultRequest;
import meilearning.com.backend.dto.response.ExamResponse;
import meilearning.com.backend.dto.response.ExamResultResponse;
import meilearning.com.backend.service.ExamService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
@Tag(name = "Exam", description = "Quản lý bài kiểm tra")
public class ExamController {

    private final ExamService examService;

    @GetMapping
    @Operation(summary = "Danh sách bài kiểm tra")
    public ResponseEntity<List<ExamResponse>> getAll(
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(examService.getAll(teacherId, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiết bài kiểm tra")
    public ResponseEntity<ExamResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Tạo bài kiểm tra (Teacher)")
    public ResponseEntity<ExamResponse> create(@Valid @RequestBody CreateExamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.create(request));
    }

    @PatchMapping("/{id}/publish")
    @Operation(summary = "Publish bài kiểm tra")
    public ResponseEntity<ExamResponse> publish(@PathVariable Long id) {
        return ResponseEntity.ok(examService.publish(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa bài kiểm tra")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        examService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Nộp bài (Student)")
    public ResponseEntity<ExamResultResponse> submit(
            @PathVariable Long id,
            @Valid @RequestBody SubmitExamResultRequest request) {
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
}
