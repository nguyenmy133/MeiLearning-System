package com.meilearning.backend.dto.response;

import lombok.*;
import java.time.Instant;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ClassSessionResponse {
    private Long id;
    private Long classId;
    private String className;
    private String subjectName;
    private String teacherName;
    private String roomName;
    private Long roomId;
    private String facilityName;
    private Long facilityId;
    private String date;
    private String startTime;
    private String endTime;
    private String status;       // upcoming, completed, cancelled
    private String type;         // regular, makeup, extra
    private String notes;
    private String classStatus;  // active, upcoming, completed
    private int totalStudents;
    private int presentCount;
    private int absentCount;
    private Instant createdAt;
}
