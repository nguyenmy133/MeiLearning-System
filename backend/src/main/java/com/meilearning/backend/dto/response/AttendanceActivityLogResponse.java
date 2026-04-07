package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceActivityLogResponse {
    private Long id;
    private Instant timestamp;
    private String studentName;
    private String className;
    private String status;      // LATE, ABSENT, ABSENT_EXCUSED
    private String updatedBy;   // E.g. "teacher_jane" or "admin_john" or "QR System"
}
