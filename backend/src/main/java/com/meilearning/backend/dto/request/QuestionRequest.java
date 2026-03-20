package com.meilearning.backend.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class QuestionRequest {
    private String type;           // "multiple-choice" | "essay"
    private String question;       // nội dung câu hỏi
    private String options;        // JSON string: [{"id":"a","text":"..."},...]
    private String correctAnswer;  // id của đáp án đúng
    private Integer points;
    private String explanation;
}
