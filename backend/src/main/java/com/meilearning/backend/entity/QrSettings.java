/**
 * Entity: Cấu hình QR — mỗi hệ thống chỉ có 1 record (singleton config).
 */
package com.meilearning.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity
@Table(name = "qr_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrSettings extends BaseEntity {

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(name = "expiry_minutes", nullable = false)
    @Builder.Default
    private Integer expiryMinutes = 5;

    @Column(name = "late_threshold_minutes", nullable = false)
    @Builder.Default
    private Integer lateThresholdMinutes = 10;

    @Column(name = "allow_regenerate", nullable = false)
    @Builder.Default
    private Boolean allowRegenerate = true;
}
