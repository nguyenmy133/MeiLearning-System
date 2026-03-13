package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Aggregate overview — tổng hợp stats từ nhiều module.
 */
@Getter
@Builder
@AllArgsConstructor
public class ReportsOverviewResponse {
    private StudentStatsResponse students;
    private TeacherStatsResponse teachers;
    private ClassStatsResponse classes;
    private TuitionStatsResponse tuition;
}
