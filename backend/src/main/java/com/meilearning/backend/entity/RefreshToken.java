package com.meilearning.backend.entity;

import java.time.Instant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity lưu refresh token trong DB.
 * Dùng opaque token (UUID) thay vì JWT để có thể revoke bất kỳ lúc nào.
 * Mỗi user chỉ có 1 refresh token active (bị ghi đè khi login lại).
 */
@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Opaque token value (UUID) — không phải JWT */
    @Column(nullable = false, unique = true, length = 512)
    private String token;

    /** Device identifier — phân biệt session trên các thiết bị khác nhau */
    @Column(name = "device_id", length = 128)
    private String deviceId;

    /** Thời điểm hết hạn — 7 ngày hoặc 30 ngày (remember me) */
    @Column(nullable = false)
    private Instant expiresAt;

    /** True khi user chọn "Ghi nhớ đăng nhập" */
    @Builder.Default
    @Column(nullable = false)
    private boolean rememberMe = false;

    /** True khi token đã bị revoke (logout) */
    @Builder.Default
    @Column(nullable = false)
    private boolean revoked = false;

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !revoked && !isExpired();
    }
}
