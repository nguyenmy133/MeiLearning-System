package com.meilearning.backend.dto.request;


import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SubmitExamResultRequest {

    private Long studentId;

    /** Giữ lại để backward-compatible, nhưng backend sẽ tự tính nếu có answers */
    private BigDecimal score;
    private Integer correctAnswers;
    private Integer timeSpent;         // phút

    /** Danh sách câu trả lời chi tiết */
    private List<AnswerItem> answers;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class AnswerItem {
        private Long questionId;
        private String selectedAnswer;  // "a", "b", "c", "d"
    }
}
