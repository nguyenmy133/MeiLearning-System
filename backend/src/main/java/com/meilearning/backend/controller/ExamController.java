package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.request.CreateExamRequest;
import com.meilearning.backend.dto.request.SubmitExamResultRequest;
import com.meilearning.backend.dto.response.ExamResponse;
import com.meilearning.backend.dto.response.ExamResultResponse;
import com.meilearning.backend.service.ExamService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
@Tag(name = "Exam", description = "Quáº£n lĂ½ bĂ i kiá»ƒm tra")
public class ExamController {

    private final ExamService examService;

    @GetMapping
    @Operation(summary = "Danh sĂ¡ch bĂ i kiá»ƒm tra")
    public ResponseEntity<List<ExamResponse>> getAll(
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(examService.getAll(teacherId, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Chi tiáº¿t bĂ i kiá»ƒm tra")
    public ResponseEntity<ExamResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Táº¡o bĂ i kiá»ƒm tra (Teacher)")
    public ResponseEntity<ExamResponse> create(@Valid @RequestBody CreateExamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.create(request));
    }

    @PatchMapping("/{id}/publish")
    @Operation(summary = "Publish bĂ i kiá»ƒm tra")
    public ResponseEntity<ExamResponse> publish(@PathVariable Long id) {
        return ResponseEntity.ok(examService.publish(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "XĂ³a bĂ i kiá»ƒm tra")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        examService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Ná»™p bĂ i (Student)")
    public ResponseEntity<ExamResultResponse> submit(
            @PathVariable Long id,
            @Valid @RequestBody SubmitExamResultRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.submit(id, request));
    }

    @GetMapping("/{id}/results")
    @Operation(summary = "Káº¿t quáº£ bĂ i kiá»ƒm tra (Teacher)")
    public ResponseEntity<List<ExamResultResponse>> getResults(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getResults(id));
    }

    @GetMapping("/{id}/results/{studentId}")
    @Operation(summary = "Káº¿t quáº£ 1 há»c viĂªn")
    public ResponseEntity<ExamResultResponse> getStudentResult(
            @PathVariable Long id,
            @PathVariable Long studentId) {
        return ResponseEntity.ok(examService.getStudentResult(id, studentId));
    }
}
