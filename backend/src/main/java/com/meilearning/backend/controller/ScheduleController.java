package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.meilearning.backend.dto.request.CreateSessionRequest;
import com.meilearning.backend.dto.request.UpdateSessionRequest;
import com.meilearning.backend.dto.response.ClassSessionResponse;
import com.meilearning.backend.dto.response.ScheduleResponse;
import com.meilearning.backend.service.ScheduleService;
import java.util.List;
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Schedule", description = "Quản lý lịch học")
@PreAuthorize("hasAnyRole('admin', 'teacher', 'student')")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/schedule")
    @Operation(summary = "Lấy lịch tổng (admin)")
    public ResponseEntity<ScheduleResponse> getSchedule(
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "week") String view,
            @RequestParam(required = false) Long facilityId) {
        return ResponseEntity.ok(scheduleService.getSchedule(date, view, facilityId));
    }

    @GetMapping("/schedule/teacher/{teacherId}")
    @Operation(summary = "Lấy lịch giáo viên")
    public ResponseEntity<ScheduleResponse> getTeacherSchedule(
            @PathVariable Long teacherId,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "week") String view) {
        return ResponseEntity.ok(scheduleService.getTeacherSchedule(teacherId, date, view));
    }

    @GetMapping("/schedule/student/{studentId}")
    @Operation(summary = "Lấy lịch học viên")
    public ResponseEntity<ScheduleResponse> getStudentSchedule(
            @PathVariable Long studentId,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "week") String view) {
        return ResponseEntity.ok(scheduleService.getStudentSchedule(studentId, date, view));
    }

    @GetMapping("/sessions")
    @Operation(summary = "Lấy sessions của 1 class")
    public ResponseEntity<List<ClassSessionResponse>> getClassSessions(
            @RequestParam Long classId) {
        return ResponseEntity.ok(scheduleService.getClassSessions(classId));
    }

    @GetMapping("/sessions/{id}")
    @Operation(summary = "Chi tiết 1 buổi học")
    public ResponseEntity<ClassSessionResponse> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getSessionById(id));
    }

    @PostMapping("/sessions/generate/{classId}")
    @Operation(summary = "Generate sessions cho 1 class từ schedule")
    public ResponseEntity<Void> generateSessions(@PathVariable Long classId) {
        scheduleService.generateSessions(classId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sessions/generate-all")
    @Operation(summary = "Generate sessions cho tất cả classes active")
    public ResponseEntity<Void> generateAllSessions() {
        scheduleService.generateAllSessions();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sessions")
    @Operation(summary = "Thêm buổi học bù / thêm")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ClassSessionResponse> addSession(@RequestBody CreateSessionRequest request) {
        return ResponseEntity.ok(scheduleService.addSession(request));
    }

    @PutMapping("/sessions/{id}")
    @Operation(summary = "Chỉnh sửa buổi học")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ClassSessionResponse> updateSession(
            @PathVariable Long id,
            @RequestBody UpdateSessionRequest request) {
        return ResponseEntity.ok(scheduleService.updateSession(id, request));
    }

    @DeleteMapping("/sessions/{id}")
    @Operation(summary = "Xóa buổi học")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        scheduleService.deleteSession(id);
        return ResponseEntity.ok().build();
    }
}
