package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateFacilityRequest {

    @NotBlank(message = "TĂªn cÆ¡ sá»Ÿ khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String name;

    @NotBlank(message = "Äá»‹a chá»‰ khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String address;

    private String phone;
    private String manager;
}
