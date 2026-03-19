package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ExamStatisticsResponse {
    private Long examId;
    private String examTitle;
    private int totalSubmissions;
    private double avgScore;
    private double passRate;        // 0-100
    private double maxScore;
    private double minScore;
    private int totalQuestions;
    private int duration;           // phút
}
