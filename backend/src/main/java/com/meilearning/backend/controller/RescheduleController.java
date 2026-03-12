package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.request.CreateRescheduleRequest;
import com.meilearning.backend.dto.response.RescheduleRequestResponse;
import com.meilearning.backend.service.RescheduleService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reschedule")
@RequiredArgsConstructor
@Tag(name = "Reschedule", description = "Quáº£n lĂ½ dá»i lá»‹ch")
public class RescheduleController {

    private final RescheduleService rescheduleService;

    @GetMapping
    @Operation(summary = "Danh sĂ¡ch yĂªu cáº§u dá»i lá»‹ch")
    public ResponseEntity<List<RescheduleRequestResponse>> getAll(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(rescheduleService.getAll(status));
    }

    @GetMapping("/teacher/{teacherId}")
    @Operation(summary = "YĂªu cáº§u theo giĂ¡o viĂªn")
    public ResponseEntity<List<RescheduleRequestResponse>> getByTeacher(
            @PathVariable Long teacherId) {
        return ResponseEntity.ok(rescheduleService.getByTeacher(teacherId));
    }

    @PostMapping
    @Operation(summary = "Táº¡o yĂªu cáº§u dá»i lá»‹ch (Teacher)")
    public ResponseEntity<RescheduleRequestResponse> create(
            @Valid @RequestBody CreateRescheduleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rescheduleService.create(request));
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Duyá»‡t yĂªu cáº§u (Admin)")
    public ResponseEntity<RescheduleRequestResponse> approve(
            @PathVariable Long id,
            @RequestParam String reviewedBy) {
        return ResponseEntity.ok(rescheduleService.approve(id, reviewedBy));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Tá»« chá»‘i yĂªu cáº§u (Admin)")
    public ResponseEntity<RescheduleRequestResponse> reject(
            @PathVariable Long id,
            @RequestParam String reviewedBy,
            @RequestParam String reason) {
        return ResponseEntity.ok(rescheduleService.reject(id, reviewedBy, reason));
    }
}
