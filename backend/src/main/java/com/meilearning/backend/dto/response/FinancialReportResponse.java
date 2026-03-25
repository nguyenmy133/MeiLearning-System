package com.meilearning.backend.dto.response;

import lombok.*;
import java.util.List;

/**
 * Response DTO cho báo cáo tài chính (Admin Reports).
 * Aggregates dữ liệu doanh thu theo tháng, theo môn, và tổng hợp học phí.
 */
@Getter
@Builder
@AllArgsConstructor
public class FinancialReportResponse {

    /** Doanh thu 6 tháng gần nhất */
    private List<MonthlyRevenue> revenueByMonth;

    /** Cơ cấu doanh thu theo môn (cho pie chart) */
    private List<ChartSlice> revenueBySubject;

    /** Tổng hợp thu học phí */
    private TuitionSummary tuitionSummary;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String month;
        private double revenue; // triệu đồng
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ChartSlice {
        private String name;
        private double value;
        private String color;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TuitionSummary {
        private long collected;
        private long pending;
        private long overdue;
        private long total;
    }
}
