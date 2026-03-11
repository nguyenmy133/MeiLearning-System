package meilearning.com.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DropStudentRequest {
    @NotBlank(message = "Lý do nghỉ không được để trống")
    private String reason;
    private String notes;
    @NotBlank(message = "Ngày nghỉ không được để trống")
    private String dropDate;
}
