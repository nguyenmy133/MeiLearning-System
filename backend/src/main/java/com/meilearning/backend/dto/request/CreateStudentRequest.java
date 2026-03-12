package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import com.meilearning.backend.entity.enums.Gender;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateStudentRequest {
    @NotBlank(message = "TĂªn há»c viĂªn khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String name;

    @NotBlank(message = "Email khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Email(message = "Email khĂ´ng há»£p lá»‡")
    private String email;

    private String phone;
    private String parentPhone;

    /** Class enrollments: [{ classId, className }] */
    private List<ClassEnrollmentDTO> classes;

    @NotBlank(message = "TĂªn Ä‘Äƒng nháº­p khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String username;

    @NotBlank(message = "Máº­t kháº©u khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
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
