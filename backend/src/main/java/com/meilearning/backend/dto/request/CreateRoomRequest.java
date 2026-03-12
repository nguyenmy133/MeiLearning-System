package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomRequest {

    @NotBlank(message = "TĂªn phĂ²ng khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String name;

    @NotNull(message = "CÆ¡ sá»Ÿ khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private Long facilityId;

    @NotNull(message = "Sá»©c chá»©a khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Min(value = 1, message = "Sá»©c chá»©a tá»‘i thiá»ƒu lĂ  1")
    @Max(value = 200, message = "Sá»©c chá»©a tá»‘i Ä‘a lĂ  200")
    private Integer capacity;
}
