package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Profile response — khớp với FE UserProfileInfo type.
 */
@Getter
@Builder
@AllArgsConstructor
public class ProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String dob;
    private String joinDate;
    private String avatar;
    private String role;
    private String gender;
    private String bio;
}
