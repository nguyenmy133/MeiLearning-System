package com.meilearning.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.Notification;
import java.time.Instant;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Notification> findByUserId(Long userId, Pageable pageable);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndIsReadFalse(Long userId);

    /** Đếm số đã đọc của user — dùng để quyết định hiện nút Xóa đã đọc */
    long countByUserIdAndIsReadTrue(Long userId);

    /** Xóa tất cả đã đọc của 1 user */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.user.id = :userId AND n.isRead = true")
    int deleteAllReadByUserId(@Param("userId") Long userId);

    /**
     * Xóa các notification theo ID — chỉ xóa nếu thuộc về userId (bảo mật).
     * Trả về số hàng bị xóa.
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.id IN :ids AND n.user.id = :userId")
    int deleteByIdsAndUserId(@Param("ids") java.util.List<Long> ids, @Param("userId") Long userId);

    /**
     * Cleanup job: xóa hàng đã đọc và đã hết hạn.
     * Chạy định kỳ qua NotificationCleanupJob.
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.isRead = true AND n.expiresAt IS NOT NULL AND n.expiresAt < :now")
    int deleteExpiredRead(@Param("now") Instant now);

    /**
     * Fallback: xóa hàng đã đọc cũ hơn cutoff khi không có expiresAt (legacy rows).
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.isRead = true AND n.expiresAt IS NULL AND n.createdAt < :cutoff")
    int deleteOldReadWithoutExpiry(@Param("cutoff") Instant cutoff);
}
