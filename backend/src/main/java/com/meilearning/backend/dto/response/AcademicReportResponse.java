package com.meilearning.backend.dto.response;

import lombok.*;
import java.util.List;

/**
 * Response DTO cho báo cáo học thuật (Admin Reports).
 * Aggregates dữ liệu điểm danh theo lớp, học viên theo môn, xu hướng tuyển sinh.
 */
@Getter
@Builder
@AllArgsConstructor
public class AcademicReportResponse {

    /** Tỉ lệ điểm danh + sĩ số từng lớp */
    private List<ClassAttendance> attendanceByClass;

    /** Phân bổ học viên theo môn (cho pie chart) */
    private List<ChartSlice> studentsBySubject;

    /** Xu hướng số lượng học viên 6 tháng gần nhất */
    private List<EnrollmentData> enrollmentTrend;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ClassAttendance {
        /** Tên lớp */
        private String className;  // JSON key: "class" via @JsonProperty
        private double rate;
        private int students;
        private int capacity;

        @com.fasterxml.jackson.annotation.JsonProperty("class")
        public String getClassName() {
            return className;
        }
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ChartSlice {
        private String name;
        private int value;
        private String color;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class EnrollmentData {
        private String month;
        private int students;
    }
}
