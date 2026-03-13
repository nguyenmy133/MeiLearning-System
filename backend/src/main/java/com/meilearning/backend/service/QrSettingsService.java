package com.meilearning.backend.service;

import com.meilearning.backend.dto.request.UpdateQrSettingsRequest;
import com.meilearning.backend.dto.response.QrSettingsResponse;

public interface QrSettingsService {
    QrSettingsResponse getSettings();
    QrSettingsResponse updateSettings(UpdateQrSettingsRequest request);
}
