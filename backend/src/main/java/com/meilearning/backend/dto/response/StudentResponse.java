package com.meilearning.backend.dto.response;

import lombok.*;
import java.time.Instant;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class StudentResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String parentPhone;
    private String avatar;
    private String dateOfBirth;
    private String gender;
    private String grade;
    private String address;
    private List<ClassEnrollmentResponse> classes;
    private String status;
    private String tuitionStatus;
    private String enrollDate;
    private String dropDate;
    private String dropReason;
    private String dropNotes;
    private Instant createdAt;
    private Instant updatedAt;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ClassEnrollmentResponse {
        private Long classId;
        private String className;
    }
}
