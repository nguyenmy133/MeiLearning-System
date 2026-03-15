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

    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;

    @NotBlank(message = "Máº­t khẩu không được để trống")
    private String password;

}
