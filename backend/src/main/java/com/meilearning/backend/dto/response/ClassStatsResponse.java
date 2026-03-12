package com.meilearning.backend.dto.response;

import lombok.*;

@Getter @Builder @AllArgsConstructor
public class ClassStatsResponse {
    private long totalClasses;
    private long activeClasses;
    private long upcomingClasses;
    private long totalStudents;
}
