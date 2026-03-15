package com.meilearning.backend.dto.response;

import lombok.*;
import java.time.Instant;
import java.util.List;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ExamResponse {
    private Long id;
    private String title;
    private String subject;
    private Long teacherId;
    private String teacherName;
    private Integer duration;
    private Integer totalQuestions;
    private String startTime;
    private String endTime;
    private String status;
    private List<Long> classIds;
    private int submittedCount;
    private double avgScore;
    private Instant createdAt;
}
