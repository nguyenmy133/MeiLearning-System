package com.meilearning.backend.dto.response;

import lombok.*;

@Getter @Builder @AllArgsConstructor
public class AttendanceStatsResponse {
    private long totalSessions;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private long excusedCount;
    private double attendanceRate;  // (PRESENT + LATE) / total * 100
}
