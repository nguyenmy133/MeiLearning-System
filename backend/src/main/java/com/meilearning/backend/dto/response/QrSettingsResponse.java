package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
@Getter
@Builder
@AllArgsConstructor
public class QrSettingsResponse {
    private Long id;
    private boolean enabled;
    private int expiryMinutes;
}
