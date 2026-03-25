package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.request.UpdateQrSettingsRequest;
import com.meilearning.backend.dto.response.QrSettingsResponse;
import com.meilearning.backend.entity.QrSettings;
import com.meilearning.backend.repository.QrSettingsRepository;
import com.meilearning.backend.service.QrSettingsService;
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QrSettingsServiceImpl implements QrSettingsService {

    private final QrSettingsRepository qrSettingsRepository;

    @Override
    @Transactional
    public QrSettingsResponse getSettings() {
        QrSettings settings = getOrCreateSettings();
        return toResponse(settings);
    }

    @Override
    @Transactional
    public QrSettingsResponse updateSettings(UpdateQrSettingsRequest request) {
        QrSettings settings = getOrCreateSettings();
        if (request.getEnabled() != null) settings.setEnabled(request.getEnabled());
        if (request.getExpiryMinutes() != null) settings.setExpiryMinutes(request.getExpiryMinutes());
        if (request.getLateThresholdMinutes() != null) settings.setLateThresholdMinutes(request.getLateThresholdMinutes());
        if (request.getAllowRegenerate() != null) settings.setAllowRegenerate(request.getAllowRegenerate());
        qrSettingsRepository.save(settings);
        return toResponse(settings);
    }

    /**
     * Singleton pattern: nếu chưa có record → tạo mới với defaults.
     */
    private QrSettings getOrCreateSettings() {
        return qrSettingsRepository.findAll().stream().findFirst()
                .orElseGet(() -> qrSettingsRepository.save(
                        QrSettings.builder().enabled(true).expiryMinutes(5)
                                .lateThresholdMinutes(10).allowRegenerate(true).build()));
    }

    private QrSettingsResponse toResponse(QrSettings s) {
        return QrSettingsResponse.builder()
                .id(s.getId())
                .enabled(Boolean.TRUE.equals(s.getEnabled()))
                .expiryMinutes(s.getExpiryMinutes())
                .lateThresholdMinutes(s.getLateThresholdMinutes() != null ? s.getLateThresholdMinutes() : 10)
                .allowRegenerate(Boolean.TRUE.equals(s.getAllowRegenerate()))
                .build();
    }
}
