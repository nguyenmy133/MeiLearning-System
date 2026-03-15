package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DropStudentRequest {

    @NotBlank(message = "L½ do nghá»‰ không được để trống")
    private String reason;
    private String notes;

    @NotBlank(message = "Ngày nghá»‰ không được để trống")
    private String dropDate;

}
