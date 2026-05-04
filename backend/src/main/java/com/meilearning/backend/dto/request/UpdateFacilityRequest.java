package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.meilearning.backend.entity.enums.FacilityStatus;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFacilityRequest {
    private String name;
    private String address;
    @Pattern(
        regexp = "^(0|\\+?84)\\d{9}$",
        message = "Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567)"
    )
    private String phone;
    private String manager;
    private FacilityStatus status;
}
