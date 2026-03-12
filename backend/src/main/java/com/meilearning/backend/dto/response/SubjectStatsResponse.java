package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Thá»‘ng kĂª Subject.
 * Khá»›p vá»›i Frontend SubjectStats interface.
 */
@Getter
@Builder
@AllArgsConstructor
public class SubjectStatsResponse {
    private long total;
    private long active;
    private long inactive;
    private long totalTeachers;
    private long totalClasses;
}
