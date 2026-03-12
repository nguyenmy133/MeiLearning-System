package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.request.CreateLeaveRequest;
import com.meilearning.backend.dto.response.LeaveRequestResponse;
import com.meilearning.backend.service.LeaveService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leave")
@RequiredArgsConstructor
@Tag(name = "Leave", description = "Quáº£n lĂ½ nghá»‰ phĂ©p")
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping
    @Operation(summary = "Danh sĂ¡ch Ä‘Æ¡n nghá»‰ phĂ©p")
    public ResponseEntity<List<LeaveRequestResponse>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String requesterType) {
        return ResponseEntity.ok(leaveService.getAll(status, requesterType));
    }

    @GetMapping("/requester/{requesterId}")
    @Operation(summary = "ÄÆ¡n theo ngÆ°á»i gá»­i")
    public ResponseEntity<List<LeaveRequestResponse>> getByRequester(
            @PathVariable Long requesterId) {
        return ResponseEntity.ok(leaveService.getByRequester(requesterId));
    }

    @PostMapping
    @Operation(summary = "Táº¡o Ä‘Æ¡n nghá»‰ phĂ©p")
    public ResponseEntity<LeaveRequestResponse> create(
            @Valid @RequestBody CreateLeaveRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveService.create(request));
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Duyá»‡t Ä‘Æ¡n")
    public ResponseEntity<LeaveRequestResponse> approve(
            @PathVariable Long id,
            @RequestParam Long reviewerId) {
        return ResponseEntity.ok(leaveService.approve(id, reviewerId));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Tá»« chá»‘i Ä‘Æ¡n")
    public ResponseEntity<LeaveRequestResponse> reject(
            @PathVariable Long id,
            @RequestParam Long reviewerId,
            @RequestParam String reason) {
        return ResponseEntity.ok(leaveService.reject(id, reviewerId, reason));
    }
}
