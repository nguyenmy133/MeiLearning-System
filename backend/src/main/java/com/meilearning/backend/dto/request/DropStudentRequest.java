package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DropStudentRequest {
    @NotBlank(message = "LĂ½ do nghá»‰ khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String reason;
    private String notes;
    @NotBlank(message = "NgĂ y nghá»‰ khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String dropDate;
}
