package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO cho login request.
 */
@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "TĂªn Ä‘Äƒng nháº­p khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String username;

    @NotBlank(message = "Máº­t kháº©u khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String password;
}
