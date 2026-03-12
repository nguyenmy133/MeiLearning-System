package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.request.CreateClassRequest;
import com.meilearning.backend.dto.request.UpdateClassRequest;
import com.meilearning.backend.dto.response.ClassResponse;
import com.meilearning.backend.dto.response.ClassStatsResponse;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.service.ClassService;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
@Tag(name = "Class", description = "Quáº£n lĂ½ lá»›p há»c")
public class ClassController {

    private final ClassService classService;

    @GetMapping
    @Operation(summary = "Láº¥y danh sĂ¡ch lá»›p há»c")
    public ResponseEntity<PageResponse<ClassResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String facility,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(classService.getAll(search, subject, facility, status, teacherId, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Láº¥y chi tiáº¿t lá»›p há»c")
    public ResponseEntity<ClassResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(classService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Táº¡o lá»›p há»c má»›i")
    public ResponseEntity<ClassResponse> create(@Valid @RequestBody CreateClassRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(classService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cáº­p nháº­t lá»›p há»c")
    public ResponseEntity<ClassResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody UpdateClassRequest request) {
        return ResponseEntity.ok(classService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "XĂ³a lá»›p há»c (pháº£i khĂ´ng active)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/end")
    @Operation(summary = "Káº¿t thĂºc lá»›p há»c")
    public ResponseEntity<Void> endClass(@PathVariable Long id) {
        classService.endClass(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "Láº¥y thá»‘ng kĂª lá»›p há»c")
    public ResponseEntity<ClassStatsResponse> getStats() {
        return ResponseEntity.ok(classService.getStats());
    }
}
