package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateRescheduleRequest {
    @NotNull
    private Long teacherId;
    @NotNull
    private Long classId;
    private Long sessionId;
    @NotBlank
    private String type;            // reschedule, cancel
    @NotBlank
    private String originalDate;    // YYYY-MM-DD
    private String originalTime;
    private String requestedDate;
    private String requestedTime;
    @NotBlank
    private String reason;
}
