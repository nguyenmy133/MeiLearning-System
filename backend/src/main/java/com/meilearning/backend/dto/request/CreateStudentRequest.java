package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import com.meilearning.backend.entity.enums.Gender;
import java.util.List;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateStudentRequest {

    @NotBlank(message = "Tên học viên không được để trống")
    private String name;

    @Email(message = "Email không hợp lệ")
    private String email;
    @Pattern(
        regexp = "^(0|\\+?84)\\d{9}$",
        message = "Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567)"
    )
    private String phone;

    @Pattern(
        regexp = "^(0|\\+?84)\\d{9}$",
        message = "Số điện thoại phụ huynh không hợp lệ (VD: 0901234567 hoặc +84901234567)"
    )
    private String parentPhone;

    /** Class enrollments: [{ classId, className }] */

    private List<ClassEnrollmentDTO> classes;

    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    // Optional fields

    private String dateOfBirth;
    private Gender gender;
    private String grade;
    private String address;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ClassEnrollmentDTO {

        private Long classId;
        private String className;

    }

}
