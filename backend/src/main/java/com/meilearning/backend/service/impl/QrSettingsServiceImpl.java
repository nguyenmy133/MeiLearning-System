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

    /** In-memory cache — singleton, evicted on update */
    private volatile QrSettings cached;

    @Override
    @Transactional
    public QrSettingsResponse getSettings() {
        return toResponse(getOrCreateSettings());
    }

    @Override
    @Transactional
    public QrSettingsResponse updateSettings(UpdateQrSettingsRequest request) {
        QrSettings settings = getOrCreateSettings();
        if (request.getEnabled() != null) settings.setEnabled(request.getEnabled());
        if (request.getExpiryMinutes() != null) settings.setExpiryMinutes(request.getExpiryMinutes());
        if (request.getLateThresholdMinutes() != null) settings.setLateThresholdMinutes(request.getLateThresholdMinutes());
        if (request.getAllowRegenerate() != null) settings.setAllowRegenerate(request.getAllowRegenerate());
        QrSettings saved = qrSettingsRepository.save(settings);
        this.cached = saved; // evict + refresh cache
        return toResponse(saved);
    }

    /**
     * Public accessor for other services (e.g. AttendanceServiceImpl).
     * Returns cached entity, avoids repeated DB calls per QR scan.
     */
    public QrSettings getCachedSettings() {
        return getOrCreateSettings();
    }

    private QrSettings getOrCreateSettings() {
        if (cached != null) return cached;
        cached = qrSettingsRepository.findAll().stream().findFirst()
                .orElseGet(() -> qrSettingsRepository.save(
                        QrSettings.builder().enabled(true).expiryMinutes(5)
                                .lateThresholdMinutes(10).allowRegenerate(true).build()));
        return cached;
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
