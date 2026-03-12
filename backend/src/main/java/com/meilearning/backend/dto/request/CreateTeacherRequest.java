package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import com.meilearning.backend.entity.enums.Gender;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateTeacherRequest {
    @NotBlank(message = "TĂªn giĂ¡o viĂªn khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String name;

    @NotBlank(message = "Email khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Email(message = "Email khĂ´ng há»£p lá»‡")
    private String email;

    private String phone;

    @NotEmpty(message = "Pháº£i chá»n Ă­t nháº¥t 1 mĂ´n dáº¡y")
    private List<String> subjects;

    @NotBlank(message = "TĂªn Ä‘Äƒng nháº­p khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String username;

    @NotBlank(message = "Máº­t kháº©u khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String password;

    // Optional fields
    private String dateOfBirth;
    private Gender gender;
    private String address;
    private String bio;
}
