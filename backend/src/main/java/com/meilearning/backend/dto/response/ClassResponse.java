package com.meilearning.backend.dto.response;

import lombok.*;
import java.time.Instant;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ClassResponse {
    private Long id;
    private String name;
    private String subject;
    private TeacherRef teacher;
    private String facility;
    private String room;
    private int students;
    private int maxStudents;
    private long pricePerSession;
    private List<SessionSlotResponse> schedule;
    private String startDate;
    private String endDate;
    private String status;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TeacherRef {
        private Long id;
        private String name;
        private String avatar;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SessionSlotResponse {
        private int weekday;
        private String startTime;
        private String endTime;
    }
}
