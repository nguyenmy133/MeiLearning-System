package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import com.meilearning.backend.entity.enums.Gender;
import java.util.List;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateStudentRequest {

    @NotBlank(message = "Tên học viên không được để trống")
    private String name;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không há»£p lá»‡")
    private String email;
    private String phone;
    private String parentPhone;

    /** Class enrollments: [{ classId, className }] */

    private List<ClassEnrollmentDTO> classes;

    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;

    @NotBlank(message = "Máº­t khẩu không được để trống")
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
