/**
 * Entity: QR Token — mã QR tạm thời cho điểm danh.
 * Mỗi token gắn với 1 session, có thời hạn (expiresAt).
 */
package com.meilearning.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "attendance_qr_tokens", indexes = {
        @Index(name = "idx_qr_token", columnList = "token", unique = true),
        @Index(name = "idx_qr_session", columnList = "session_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceQrToken extends BaseEntity {

    @Column(nullable = false, unique = true, length = 64)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ClassSession session;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
}
