package com.meilearning.backend.dto.response;

import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class QuestionResponse {
    private Long id;
    private Integer orderIndex;
    private String type;
    private String question;       // maps to questionText
    private String options;        // JSON string
    private String correctAnswer;
    private Integer points;
    private String explanation;
}
