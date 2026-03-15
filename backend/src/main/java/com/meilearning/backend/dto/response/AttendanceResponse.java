package com.meilearning.backend.dto.response;

import lombok.*;
import java.time.Instant;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AttendanceResponse {
    private Long id;
    private Long sessionId;
    private Long studentId;
    private String studentName;
    private String status;       // PRESENT, ABSENT, LATE, ABSENT_EXCUSED
    private String checkInTime;
    private String method;       // manual, qr
    private String note;
    private Instant createdAt;
}
