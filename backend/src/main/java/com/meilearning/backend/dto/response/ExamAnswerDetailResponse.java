package com.meilearning.backend.dto.response;

import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ExamAnswerDetailResponse {
    private Long id;
    private Long questionId;
    private String questionType;       // "multiple-choice" | "essay"
    private String selectedAnswer;     // user đã chọn: "a"/"b"/... hoặc text tự luận
    private String correctAnswer;      // đáp án đúng: "a"/"b"/... (null cho essay)
    private Boolean isCorrect;
    private Integer essayScore;        // điểm teacher chấm (null = chưa chấm)
    private Integer maxPoints;         // điểm tối đa của câu hỏi
    private String teacherComment;     // nhận xét của teacher
}
