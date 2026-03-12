package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.request.CreateStudentRequest;
import com.meilearning.backend.dto.request.DropStudentRequest;
import com.meilearning.backend.dto.request.UpdateStudentRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.StudentResponse;
import com.meilearning.backend.dto.response.StudentStatsResponse;
import com.meilearning.backend.service.StudentService;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@Tag(name = "Student", description = "Quáº£n lĂ½ há»c viĂªn")
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    @Operation(summary = "Láº¥y danh sĂ¡ch há»c viĂªn")
    public ResponseEntity<PageResponse<StudentResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String tuitionStatus,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(studentService.getAll(search, classId, status, tuitionStatus, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Láº¥y chi tiáº¿t há»c viĂªn")
    public ResponseEntity<StudentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Táº¡o há»c viĂªn má»›i (auto-create User account)")
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody CreateStudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cáº­p nháº­t thĂ´ng tin há»c viĂªn")
    public ResponseEntity<StudentResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateStudentRequest request) {
        return ResponseEntity.ok(studentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "XĂ³a há»c viĂªn (pháº£i inactive)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/drop")
    @Operation(summary = "Ghi nháº­n nghá»‰ há»c")
    public ResponseEntity<Void> dropStudent(@PathVariable Long id,
                                             @Valid @RequestBody DropStudentRequest request) {
        studentService.dropStudent(id, request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/reactivate")
    @Operation(summary = "KĂ­ch hoáº¡t láº¡i há»c viĂªn")
    public ResponseEntity<Void> reactivateStudent(@PathVariable Long id) {
        studentService.reactivateStudent(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reset-password")
    @Operation(summary = "Reset máº­t kháº©u há»c viĂªn")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id) {
        studentService.resetPassword(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "Láº¥y thá»‘ng kĂª há»c viĂªn")
    public ResponseEntity<StudentStatsResponse> getStats() {
        return ResponseEntity.ok(studentService.getStats());
    }
}
