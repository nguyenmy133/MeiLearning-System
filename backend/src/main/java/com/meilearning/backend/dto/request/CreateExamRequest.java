package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateExamRequest {

    @NotBlank
    private String title;

    private String subject;                // auto-detected từ classes trên FE

    private Long teacherId;                // Controller set từ JWT

    @NotNull
    private Integer duration;          // phút
    private Integer totalQuestions;
    private String startTime;          // ISO-8601
    private String endTime;
    private List<Long> classIds;       // classes tham gia
    private String description;
    private Integer maxAttempts;
    private Integer passingScore;

    /** Danh sách câu hỏi gửi kèm khi tạo bài thi */
    private List<QuestionRequest> questions;
}

