package com.meilearning.backend.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.meilearning.backend.entity.RefreshToken;
import com.meilearning.backend.entity.User;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    /**
     * Lấy tất cả session của user, sắp xếp mới nhất trước.
     * Dùng để kiểm tra giới hạn số lượng session.
     */
    List<RefreshToken> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Xoá token cụ thể khi logout (thay vì xoá tất cả của user).
     * Multi-device: logout 1 thiết bị không ảnh hưởng thiết bị khác.
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.token = :token")
    void deleteByToken(@Param("token") String token);

    /**
     * Xoá toàn bộ session của user — dùng cho "logout tất cả thiết bị"
     * hoặc khi đổi mật khẩu.
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.user = :user")
    void deleteByUser(@Param("user") User user);

    /** Cleanup job: xoá token đã hết hạn */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") Instant now);
}
