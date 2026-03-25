package com.meilearning.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.meilearning.backend.dto.response.AcademicReportResponse;
import com.meilearning.backend.dto.response.FinancialReportResponse;
import com.meilearning.backend.dto.response.ReportsOverviewResponse;
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
    @Operation(summary = "Báo cáo học thuật (điểm danh theo lớp, HV theo môn, xu hướng)")
    public ResponseEntity<AcademicReportResponse> getAcademicReport() {
        return ResponseEntity.ok(reportsService.getAcademicReport());
    }

    @GetMapping("/tuition")
    @Operation(summary = "Báo cáo tài chính (doanh thu theo tháng, theo môn, tổng hợp thu phí)")
    public ResponseEntity<FinancialReportResponse> getFinancialReport() {
        return ResponseEntity.ok(reportsService.getFinancialReport());
    }
}
