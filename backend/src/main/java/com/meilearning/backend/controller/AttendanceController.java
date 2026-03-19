package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.meilearning.backend.dto.request.BulkAttendanceRequest;
import com.meilearning.backend.dto.response.AttendanceResponse;
import com.meilearning.backend.dto.response.AttendanceStatsResponse;
import com.meilearning.backend.dto.response.ClassSessionResponse;
import com.meilearning.backend.service.AttendanceService;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Quản lý điểm danh")
@PreAuthorize("hasAnyRole('admin', 'teacher', 'student')")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    @Operation(summary = "Lấy danh sách điểm danh theo buổi")
    public ResponseEntity<List<AttendanceResponse>> getBySession(@RequestParam Long sessionId) {
        return ResponseEntity.ok(attendanceService.getBySession(sessionId));
    }

    /**
     * Lấy danh sách buổi dạy của teacher đang đăng nhập.
     * Resolve teacher từ JWT Principal, KHÔNG cần FE truyền teacherId.
     */
    @GetMapping("/sessions/teacher/me")
    @Operation(summary = "Lấy buổi dạy của giáo viên đang đăng nhập (theo ngày)")
    @PreAuthorize("hasRole('teacher')")
    public ResponseEntity<List<ClassSessionResponse>> getMyTeacherSessions(
            Principal principal,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(
                attendanceService.getSessionsByTeacherUsername(principal.getName(), date));
    }

    @PostMapping("/bulk")
    @Operation(summary = "Điểm danh hàng loạt (teacher)")
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
    @Operation(summary = "Thống kê điểm danh")
    public ResponseEntity<AttendanceStatsResponse> getStats(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(attendanceService.getStats(classId, month));
    }

    @GetMapping("/alerts")
    @Operation(summary = "Lấy cảnh báo vắng mặt (stub)")
    public ResponseEntity<List<Object>> getAlerts() {
        return ResponseEntity.ok(java.util.Collections.emptyList());
    }

}
