package com.meilearning.backend.dto.response;

import lombok.*;
import java.math.BigDecimal;

/**
 * DTO nhỏ — đại diện điểm 1 bài thi của 1 student.
 * Được nhúng vào GradeResponse.examScores[].
 */
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ExamScoreItem {
    private Long examId;
    private String examTitle;
    private BigDecimal score;     // 0-10 (converted from 0-100)
    private Boolean passed;
    private String date;          // ISO date of exam end time (fallback)
    /** Ngày giờ student nộp bài */
    private String submittedAt;
    /** no_essay | pending | graded */
    private String gradingStatus;
}
