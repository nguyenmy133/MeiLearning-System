package com.meilearning.backend.dto.response;

import lombok.*;
import java.util.List;

/**
 * Aggregate response cho Admin Dashboard — 1 request trả về toàn bộ data.
 */
@Getter
@Builder
@AllArgsConstructor
public class DashboardResponse {

    /** 4 stat cards: Tổng HV, Giáo viên, Lớp active, Doanh thu tháng */
    private List<StatItem> stats;

    /** Doanh thu 7 ngày gần nhất (triệu đồng) */
    private List<DailyRevenue> revenueData;

    /** Lịch học hôm nay */
    private List<TodaySession> todaySchedule;

    /** Điểm danh hôm nay */
    private TodayAttendance todayAttendance;

    /** Cảnh báo */
    private List<AlertItem> alerts;

    /** Học phí quá hạn */
    private List<OverdueItem> overdueStudents;

    // ── Inner DTOs ────────────────────────────────────────────────────

    @Getter @Builder @AllArgsConstructor
    public static class StatItem {
        private String label;
        private String value;
        private String change;
        private String trend; // "up" | "down"
    }

    @Getter @Builder @AllArgsConstructor
    public static class DailyRevenue {
        private String day;
        private double revenue;
    }

    @Getter @Builder @AllArgsConstructor
    public static class TodaySession {
        private Long id;
        private Long classId;
        private String time;
        /** JSON key: "class" */
        @com.fasterxml.jackson.annotation.JsonProperty("class")
        private String className;
        private String teacher;
        private String room;
        private int students;
        private String status; // "completed" | "ongoing" | "upcoming"
    }

    @Getter @Builder @AllArgsConstructor
    public static class TodayAttendance {
        private int total;
        private int present;
        private int absent;
        private int late;
    }

    @Getter @Builder @AllArgsConstructor
    public static class AlertItem {
        private int id;
        private String type; // "warning" | "info"
        private String message;
        private String action;
        private String link;
    }

    @Getter @Builder @AllArgsConstructor
    public static class OverdueItem {
        private Long studentId;
        private String invoiceId;
        private String name;
        /** JSON key: "class" */
        @com.fasterxml.jackson.annotation.JsonProperty("class")
        private String className;
        private String amount;
        private int days;
    }
}
