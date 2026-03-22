package com.meilearning.backend.dto.response;

import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ExamAnswerDetailResponse {
    private Long questionId;
    private String selectedAnswer;   // user đã chọn: "a", "b", ...
    private String correctAnswer;    // đáp án đúng: "a", "b", ...
    private Boolean isCorrect;
}
