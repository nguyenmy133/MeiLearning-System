package com.meilearning.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class UpdateQrSettingsRequest {
    private Boolean enabled;
    private Integer expiryMinutes;
}
