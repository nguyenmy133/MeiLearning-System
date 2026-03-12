package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateGradeRequest {
    @NotNull
    private Long studentId;
    @NotNull
    private Long classId;
    private BigDecimal avgScore;
    private String trend;       // up, down, stable
    private Integer attendanceRate;
    private String comment;
}
