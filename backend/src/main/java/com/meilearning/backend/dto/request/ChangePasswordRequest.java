package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**

 * DTO cho Ä‘á»•i máº­t khẩu.

 */

@Getter
@Setter
public class ChangePasswordRequest {

    @NotBlank(message = "Máº­t khẩu hiện tại không được để trống")
    private String currentPassword;

    @NotBlank(message = "Máº­t khẩu má»›i không được để trống")
    @Size(min = 6, message = "Máº­t khẩu má»›i pháº£i có ­t nháº¥t 6 k½ tá»±")
    private String newPassword;

}
