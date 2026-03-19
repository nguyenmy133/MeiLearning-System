package com.meilearning.backend.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class GradeStatsResponse {
    private int totalStudents;
    private BigDecimal averageScore;
    private double passRate;
    private double averageAttendance;
    private double avg;
    private int pass;
    private int fail;
    private int total;
}

