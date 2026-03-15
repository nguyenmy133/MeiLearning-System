package com.meilearning.backend.dto.response;

import lombok.*;
@Getter @Builder @AllArgsConstructor
public class TeacherStatsResponse {
    private long totalTeachers;
    private long activeTeachers;
    private long totalClasses;
    private long totalSubjects;
}
