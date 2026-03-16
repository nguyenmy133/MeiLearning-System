package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import com.meilearning.backend.entity.enums.Gender;
import java.util.List;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateTeacherRequest {

    @NotBlank(message = "Tên giáo viên không được để trống")
    private String name;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lá»‡")
    private String email;
    private String phone;

    @NotEmpty(message = "Pháº£i chá»n ít nhất 1 môn dạy")
    private List<String> subjects;

    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    // Optional fields
    private String dateOfBirth;
    private Gender gender;
    private String address;
    private String bio;

}
