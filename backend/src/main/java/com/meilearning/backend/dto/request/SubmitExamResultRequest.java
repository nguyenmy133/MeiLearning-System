package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SubmitExamResultRequest {
    @NotNull
    private Long studentId;
    @NotNull
    private BigDecimal score;          // 0-100
    private Integer correctAnswers;
    private Integer timeSpent;         // phĂºt
}
