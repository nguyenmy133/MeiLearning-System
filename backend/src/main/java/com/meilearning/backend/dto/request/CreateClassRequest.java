package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateClassRequest {
    @NotBlank(message = "TĂªn lá»›p khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String name;

    @NotBlank(message = "MĂ´n há»c khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String subject;

    @NotNull(message = "GiĂ¡o viĂªn khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private Long teacherId;

    private String facility;
    private String room;

    @NotNull @Min(1)
    private Integer maxStudents;

    @NotNull @Positive
    private Long pricePerSession;

    private List<SessionSlotDTO> schedule;
    private String startDate;
    private String description;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class SessionSlotDTO {
        private int weekday;
        private String startTime;
        private String endTime;
    }
}
