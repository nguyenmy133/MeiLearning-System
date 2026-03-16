package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateFacilityRequest {

    @NotBlank(message = "Tên cơ sở không được để trống")
    private String name;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;
    private String phone;
    private String manager;

}
