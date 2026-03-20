package com.meilearning.backend.dto.request;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateExamRequest {
    private String title;
    private String description;
    private Integer duration;
    private String startTime;      // ISO-8601
    private String endTime;        // ISO-8601
    private Integer maxAttempts;
    private Integer passingScore;
    /** Chỉ được cập nhật khi status = draft */
    private List<QuestionRequest> questions;
    private List<Long> classIds;
}
