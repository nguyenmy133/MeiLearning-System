package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.request.CreateSubjectRequest;
import com.meilearning.backend.dto.request.UpdateSubjectRequest;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.dto.response.SubjectResponse;
import com.meilearning.backend.dto.response.SubjectStatsResponse;
import com.meilearning.backend.service.SubjectService;

@RestController
@RequestMapping("/api/v1/subjects")
@RequiredArgsConstructor
@Tag(name = "Subject", description = "Quáº£n lĂ½ mĂ´n há»c")
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    @Operation(summary = "Láº¥y danh sĂ¡ch mĂ´n há»c (phĂ¢n trang + filter)")
    public ResponseEntity<PageResponse<SubjectResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(subjectService.getAll(search, category, status, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Láº¥y chi tiáº¿t mĂ´n há»c theo ID")
    public ResponseEntity<SubjectResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(subjectService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Táº¡o mĂ´n há»c má»›i")
    public ResponseEntity<SubjectResponse> create(@Valid @RequestBody CreateSubjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subjectService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cáº­p nháº­t mĂ´n há»c")
    public ResponseEntity<SubjectResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSubjectRequest request) {
        return ResponseEntity.ok(subjectService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "XĂ³a mĂ´n há»c")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        subjectService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "Láº¥y thá»‘ng kĂª mĂ´n há»c")
    public ResponseEntity<SubjectStatsResponse> getStats() {
        return ResponseEntity.ok(subjectService.getStats());
    }
}
