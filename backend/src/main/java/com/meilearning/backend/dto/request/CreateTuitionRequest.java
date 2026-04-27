package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateTuitionRequest {
    @NotNull
    private Long studentId;
    @NotNull
    private Long classId;
    @NotNull
    private String month;       // "MM/YYYY"
}
