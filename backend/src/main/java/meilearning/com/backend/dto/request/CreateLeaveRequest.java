package meilearning.com.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateLeaveRequest {
    @NotNull
    private Long requesterId;
    @NotBlank
    private String requesterType;  // student, teacher
    private Long sessionId;
    @NotBlank
    private String type;           // leave, late
    @NotBlank
    private String reason;
}
