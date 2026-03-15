package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**

 * Thống kª Subject.

 * Khá»›p với Frontend SubjectStats interface.

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
