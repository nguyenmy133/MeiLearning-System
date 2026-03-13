package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.QrSettings;

@Repository
public interface QrSettingsRepository extends JpaRepository<QrSettings, Long> {
}
