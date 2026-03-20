package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateRescheduleRequest {
    // Optional khi dùng endpoint /reschedule/me — backend resolve từ JWT
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
    private String requestedEndTime;
    @NotBlank
    private String reason;
}
