package com.meilearning.backend.dto.response;

import lombok.*;
@Getter @Builder @AllArgsConstructor
public class StudentStatsResponse {
    private long totalStudents;
    private long activeStudents;
    private long paidTuitionCount;
    private long inactiveStudents;
}
