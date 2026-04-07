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
    private List<String> classNames;
    private int submittedCount;
    private double avgScore;
    private Instant createdAt;
    private Integer totalStudents;
    private String description;
    /** Danh sách câu hỏi — chỉ populate khi gọi GET /exams/{id} */
    private List<QuestionResponse> questions;

    // ── Student-specific: populate khi student xem danh sách exam ──
    /** Thời gian nộp bài của student hiện tại (null nếu chưa nộp) */
    private String mySubmittedAt;
    /** Điểm của student hiện tại */
    private Double myScore;
    /** Student đạt hay chưa */
    private Boolean myPassed;
    /** Thời gian làm bài (phút), cho phép làm */
    private Integer myDurationMinutes;
    /** Thời gian thực tế đã làm (phút) */
    private Integer myTimeSpent;
    /** Trạng thái chấm tự luận: "graded" | "pending" | "no_essay" */
    private String myGradingStatus;
    
    private Integer maxAttempts;
    private String myScoreHistory;
}


