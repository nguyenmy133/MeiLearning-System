package com.meilearning.backend.service;

import com.meilearning.backend.dto.response.AttendanceStatsResponse;
import com.meilearning.backend.dto.response.ReportsOverviewResponse;
import com.meilearning.backend.dto.response.TuitionStatsResponse;

public interface ReportsService {
    ReportsOverviewResponse getOverview();
    AttendanceStatsResponse getAttendanceReport(Long classId, String month);
    TuitionStatsResponse getTuitionReport(String month);
}
