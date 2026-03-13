package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.request.UpdateGradeRequest;
import com.meilearning.backend.dto.response.GradeResponse;
import com.meilearning.backend.service.GradeService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/grades")
@RequiredArgsConstructor
@Tag(name = "Grade", description = "Quản lý điểm")
public class GradeController {

    private final GradeService gradeService;

    @GetMapping
    @Operation(summary = "Điểm theo lớp")
    public ResponseEntity<List<GradeResponse>> getByClass(@RequestParam Long classId) {
        return ResponseEntity.ok(gradeService.getByClass(classId));
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Điểm của học viên")
    public ResponseEntity<List<GradeResponse>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(gradeService.getByStudent(studentId));
    }

    @PutMapping
    @Operation(summary = "Cập nhật điểm (Teacher)")
    public ResponseEntity<GradeResponse> update(@Valid @RequestBody UpdateGradeRequest request) {
        return ResponseEntity.ok(gradeService.update(request));
    }
}
