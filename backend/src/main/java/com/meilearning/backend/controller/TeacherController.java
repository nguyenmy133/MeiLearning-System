package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.request.CreateTeacherRequest;
import com.meilearning.backend.dto.request.UpdateTeacherRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.TeacherResponse;
import com.meilearning.backend.dto.response.TeacherStatsResponse;
import com.meilearning.backend.service.TeacherService;

@RestController
@RequestMapping("/api/v1/teachers")
@RequiredArgsConstructor
@Tag(name = "Teacher", description = "Quáº£n lĂ½ giĂ¡o viĂªn")
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    @Operation(summary = "Láº¥y danh sĂ¡ch giĂ¡o viĂªn")
    public ResponseEntity<PageResponse<TeacherResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(teacherService.getAll(search, subject, status, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Láº¥y chi tiáº¿t giĂ¡o viĂªn")
    public ResponseEntity<TeacherResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(teacherService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Táº¡o giĂ¡o viĂªn má»›i (auto-create User account)")
    public ResponseEntity<TeacherResponse> create(@Valid @RequestBody CreateTeacherRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teacherService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cáº­p nháº­t thĂ´ng tin giĂ¡o viĂªn")
    public ResponseEntity<TeacherResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateTeacherRequest request) {
        return ResponseEntity.ok(teacherService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "XĂ³a giĂ¡o viĂªn (pháº£i khĂ´ng cĂ³ lá»›p)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        teacherService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reset-password")
    @Operation(summary = "Reset máº­t kháº©u giĂ¡o viĂªn")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id) {
        teacherService.resetPassword(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/lock")
    @Operation(summary = "KhĂ³a tĂ i khoáº£n giĂ¡o viĂªn")
    public ResponseEntity<Void> lockAccount(@PathVariable Long id) {
        teacherService.lockAccount(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/unlock")
    @Operation(summary = "Má»Ÿ khĂ³a tĂ i khoáº£n giĂ¡o viĂªn")
    public ResponseEntity<Void> unlockAccount(@PathVariable Long id) {
        teacherService.unlockAccount(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "Láº¥y thá»‘ng kĂª giĂ¡o viĂªn")
    public ResponseEntity<TeacherStatsResponse> getStats() {
        return ResponseEntity.ok(teacherService.getStats());
    }
}
