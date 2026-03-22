package com.meilearning.backend.dto.request;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class GradeEssayRequest {

    private List<EssayGradeItem> grades;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class EssayGradeItem {
        /** ID của ExamAnswerDetail */
        private Long answerDetailId;
        /** Điểm (0 → maxPoints của câu hỏi) */
        private Integer score;
        /** Nhận xét của teacher */
        private String comment;
    }
}
