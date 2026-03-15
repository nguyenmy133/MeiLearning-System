package com.meilearning.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class UpdateProfileRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
}
