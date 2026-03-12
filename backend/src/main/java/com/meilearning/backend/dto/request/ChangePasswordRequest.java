package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO cho Ä‘á»•i máº­t kháº©u.
 */
@Getter
@Setter
public class ChangePasswordRequest {

    @NotBlank(message = "Máº­t kháº©u hiá»‡n táº¡i khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String currentPassword;

    @NotBlank(message = "Máº­t kháº©u má»›i khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Size(min = 6, message = "Máº­t kháº©u má»›i pháº£i cĂ³ Ă­t nháº¥t 6 kĂ½ tá»±")
    private String newPassword;
}
