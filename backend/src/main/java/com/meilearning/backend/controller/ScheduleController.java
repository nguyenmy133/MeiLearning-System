package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.response.ClassSessionResponse;
import com.meilearning.backend.dto.response.ScheduleResponse;
import com.meilearning.backend.service.ScheduleService;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Schedule", description = "Quáº£n lĂ½ lá»‹ch há»c")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/schedule")
    @Operation(summary = "Láº¥y lá»‹ch tá»•ng (admin)")
    public ResponseEntity<ScheduleResponse> getSchedule(
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "week") String view) {
        return ResponseEntity.ok(scheduleService.getSchedule(date, view));
    }

    @GetMapping("/schedule/teacher/{teacherId}")
    @Operation(summary = "Láº¥y lá»‹ch giĂ¡o viĂªn")
    public ResponseEntity<ScheduleResponse> getTeacherSchedule(
            @PathVariable Long teacherId,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "week") String view) {
        return ResponseEntity.ok(scheduleService.getTeacherSchedule(teacherId, date, view));
    }

    @GetMapping("/schedule/student/{studentId}")
    @Operation(summary = "Láº¥y lá»‹ch há»c viĂªn")
    public ResponseEntity<ScheduleResponse> getStudentSchedule(
            @PathVariable Long studentId,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "week") String view) {
        return ResponseEntity.ok(scheduleService.getStudentSchedule(studentId, date, view));
    }

    @GetMapping("/sessions")
    @Operation(summary = "Láº¥y sessions cá»§a 1 class")
    public ResponseEntity<List<ClassSessionResponse>> getClassSessions(
            @RequestParam Long classId) {
        return ResponseEntity.ok(scheduleService.getClassSessions(classId));
    }

    @GetMapping("/sessions/{id}")
    @Operation(summary = "Chi tiáº¿t 1 buá»•i há»c")
    public ResponseEntity<ClassSessionResponse> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getSessionById(id));
    }

    @PostMapping("/sessions/generate/{classId}")
    @Operation(summary = "Generate sessions cho 1 class tá»« schedule")
    public ResponseEntity<Void> generateSessions(@PathVariable Long classId) {
        scheduleService.generateSessions(classId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sessions/generate-all")
    @Operation(summary = "Generate sessions cho táº¥t cáº£ classes active")
    public ResponseEntity<Void> generateAllSessions() {
        scheduleService.generateAllSessions();
        return ResponseEntity.ok().build();
    }
}
