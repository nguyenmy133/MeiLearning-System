package com.meilearning.backend.service;

import com.meilearning.backend.dto.response.AcademicReportResponse;
import com.meilearning.backend.dto.response.AttendanceStatsResponse;
import com.meilearning.backend.dto.response.FinancialReportResponse;
import com.meilearning.backend.dto.response.ReportsOverviewResponse;
import com.meilearning.backend.dto.response.TuitionStatsResponse;

public interface ReportsService {
    ReportsOverviewResponse getOverview();
    AttendanceStatsResponse getAttendanceReport(Long classId, String month);
    TuitionStatsResponse getTuitionReport(String month);

    /** Báo cáo tài chính (doanh thu theo tháng, theo môn, tổng hợp thu phí) */
    FinancialReportResponse getFinancialReport();

    /** Báo cáo học thuật (điểm danh theo lớp, HV theo môn, xu hướng tuyển sinh) */
    AcademicReportResponse getAcademicReport();
}
