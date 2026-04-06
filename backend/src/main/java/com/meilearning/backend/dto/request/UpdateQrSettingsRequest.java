package com.meilearning.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class UpdateQrSettingsRequest {
    private Boolean enabled;

    @Min(value = 1, message = "Thời gian hiệu lực QR tối thiểu 1 phút")
    @Max(value = 30, message = "Thời gian hiệu lực QR tối đa 30 phút")
    private Integer expiryMinutes;

    @Min(value = 1, message = "Ngưỡng đi muộn tối thiểu 1 phút")
    @Max(value = 60, message = "Ngưỡng đi muộn tối đa 60 phút")
    private Integer lateThresholdMinutes;

    private Boolean allowRegenerate;
}
