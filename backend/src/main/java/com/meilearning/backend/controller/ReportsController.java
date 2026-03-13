package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.meilearning.backend.dto.response.AttendanceStatsResponse;
import com.meilearning.backend.dto.response.ReportsOverviewResponse;
import com.meilearning.backend.dto.response.TuitionStatsResponse;
import com.meilearning.backend.service.ReportsService;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Báo cáo tổng hợp")
@PreAuthorize("hasRole('admin')")
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping("/overview")
    @Operation(summary = "Báo cáo tổng quan (students + teachers + classes + tuition)")
    public ResponseEntity<ReportsOverviewResponse> getOverview() {
        return ResponseEntity.ok(reportsService.getOverview());
    }

    @GetMapping("/attendance")
    @Operation(summary = "Báo cáo điểm danh")
    public ResponseEntity<AttendanceStatsResponse> getAttendanceReport(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(reportsService.getAttendanceReport(classId, month));
    }

    @GetMapping("/tuition")
    @Operation(summary = "Báo cáo học phí / doanh thu")
    public ResponseEntity<TuitionStatsResponse> getTuitionReport(
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(reportsService.getTuitionReport(month));
    }
}
