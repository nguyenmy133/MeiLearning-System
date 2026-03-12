package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.request.BulkAttendanceRequest;
import com.meilearning.backend.dto.response.AttendanceResponse;
import com.meilearning.backend.dto.response.AttendanceStatsResponse;
import com.meilearning.backend.service.AttendanceService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Quáº£n lĂ½ Ä‘iá»ƒm danh")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    @Operation(summary = "Láº¥y danh sĂ¡ch Ä‘iá»ƒm danh theo buá»•i")
    public ResponseEntity<List<AttendanceResponse>> getBySession(
            @RequestParam Long sessionId) {
        return ResponseEntity.ok(attendanceService.getBySession(sessionId));
    }

    @PostMapping("/bulk")
    @Operation(summary = "Äiá»ƒm danh hĂ ng loáº¡t (teacher)")
    public ResponseEntity<List<AttendanceResponse>> bulkAttendance(
            @Valid @RequestBody BulkAttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.bulkAttendance(request));
    }

    @PostMapping("/check-in")
    @Operation(summary = "QR Check-in (student)")
    public ResponseEntity<AttendanceResponse> qrCheckIn(
            @RequestParam Long sessionId,
            @RequestParam Long studentId) {
        return ResponseEntity.ok(attendanceService.qrCheckIn(sessionId, studentId));
    }

    @GetMapping("/stats")
    @Operation(summary = "Thá»‘ng kĂª Ä‘iá»ƒm danh")
    public ResponseEntity<AttendanceStatsResponse> getStats(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(attendanceService.getStats(classId, month));
    }
}
