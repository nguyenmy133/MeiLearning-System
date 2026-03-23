package com.meilearning.backend.repository;

import com.meilearning.backend.entity.AttendanceQrToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.time.Instant;
import java.util.Optional;

public interface AttendanceQrTokenRepository extends JpaRepository<AttendanceQrToken, Long> {

    /** Tìm token active chưa hết hạn */
    Optional<AttendanceQrToken> findByTokenAndActiveTrue(String token);

    /** Tìm token active chưa hết hạn cho 1 session (dùng để restore QR khi teacher quay lại) */
    Optional<AttendanceQrToken> findBySessionIdAndActiveTrueAndExpiresAtAfter(Long sessionId, Instant now);

    /** Deactivate tất cả token cũ của session */
    @Modifying
    @Query("UPDATE AttendanceQrToken t SET t.active = false WHERE t.session.id = :sessionId AND t.active = true")
    void deactivateBySessionId(Long sessionId);

    /** Xóa token đã hết hạn (cho scheduled cleanup) */
    @Modifying
    @Query("DELETE FROM AttendanceQrToken t WHERE t.expiresAt < :now")
    void deleteExpiredBefore(Instant now);
}
