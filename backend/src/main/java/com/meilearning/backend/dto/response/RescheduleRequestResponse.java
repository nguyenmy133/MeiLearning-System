package com.meilearning.backend.dto.response;

import lombok.*;
import java.time.Instant;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RescheduleRequestResponse {
    private Long id;
    private Long teacherId;
    private String teacherName;
    private Long classId;
    private String className;
    private Long sessionId;
    private String type;
    private String originalDate;
    private String originalTime;
    private String requestedDate;
    private String requestedTime;
    private String reason;
    private String status;
    private String reviewedBy;
    private Instant reviewedAt;
    private String rejectReason;
    private Instant createdAt;
}
