package meilearning.com.backend.dto.response;

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
    private Integer timeSpent;
    private Boolean passed;
    private Instant submittedAt;
}
