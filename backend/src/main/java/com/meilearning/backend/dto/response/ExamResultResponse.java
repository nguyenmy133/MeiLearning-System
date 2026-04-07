package com.meilearning.backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ExamResultResponse {
    private Long id;
    private Long examId;
    private String examTitle;
    private Long studentId;
    private String studentName;
    private BigDecimal score;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Integer timeSpent;
    private Boolean passed;
    private Instant submittedAt;
    /** Trạng thái chấm: "graded" | "pending" | "no_essay" */
    private String gradingStatus;
    private String scoreHistory;
}
