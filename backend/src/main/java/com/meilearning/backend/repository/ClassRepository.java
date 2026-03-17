package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.ClassEntity;
import com.meilearning.backend.entity.enums.ClassStatus;
import java.util.List;
@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, Long>, JpaSpecificationExecutor<ClassEntity> {

    List<ClassEntity> findByStatus(ClassStatus status);

    List<ClassEntity> findByTeacherId(Long teacherId);

    List<ClassEntity> findBySubjectId(Long subjectId);

    List<ClassEntity> findByRoomId(Long roomId);

    long countByStatus(ClassStatus status);

    long countByTeacherId(Long teacherId);

    @Query("SELECT c FROM ClassEntity c WHERE c.status IN ('active', 'upcoming')")
    List<ClassEntity> findActiveAndUpcoming();

    @Query("SELECT COALESCE(SUM(SIZE(c.enrollments)), 0) FROM ClassEntity c WHERE c.status = 'active'")
    long countTotalStudentsInActiveClasses();

    /** Lấy các lớp upcoming mà startDate đã đến (để auto-activate) */
    List<ClassEntity> findByStatusAndStartDateLessThanEqual(ClassStatus status, java.time.LocalDate date);

    /** Lấy các lớp active/upcoming đang dùng phòng này (để kiểm tra xung đột) */
    @Query("SELECT c FROM ClassEntity c WHERE c.room.id = :roomId AND c.status IN ('active', 'upcoming')")
    List<ClassEntity> findActiveOrUpcomingByRoomId(@org.springframework.data.repository.query.Param("roomId") Long roomId);

}
