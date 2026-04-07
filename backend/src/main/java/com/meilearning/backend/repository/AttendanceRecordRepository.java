package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.AttendanceRecord;
import com.meilearning.backend.entity.enums.AttendanceStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findBySessionId(Long sessionId);

    List<AttendanceRecord> findByStudentId(Long studentId);

    Optional<AttendanceRecord> findBySessionIdAndStudentId(Long sessionId, Long studentId);

    boolean existsBySessionIdAndStudentId(Long sessionId, Long studentId);

    long countBySessionId(Long sessionId);

    long countBySessionIdAndStatus(Long sessionId, AttendanceStatus status);

    @Query("SELECT COUNT(ar) FROM AttendanceRecord ar " +
            "WHERE ar.student.id = :studentId AND ar.status = :status " +
            "AND ar.session.classEntity.id = :classId")
    long countByStudentIdAndClassIdAndStatus(Long studentId, Long classId, AttendanceStatus status);

    @Query("SELECT COUNT(ar) FROM AttendanceRecord ar WHERE ar.student.id = :studentId " +
            "AND ar.session.classEntity.id = :classId")
    long countByStudentIdAndClassId(Long studentId, Long classId);

    // ── C4: Aggregate attendance stats — eliminates N+1 in AttendanceService.getStats() ──

    @Query("SELECT ar.status, COUNT(ar) FROM AttendanceRecord ar " +
            "WHERE ar.session.classEntity.id = :classId " +
            "AND ar.session.date BETWEEN :startDate AND :endDate " +
            "GROUP BY ar.status")
    List<Object[]> countByStatusForClassAndMonth(@Param("classId") Long classId,
                                                 @Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);

    @Query("SELECT ar.status, COUNT(ar) FROM AttendanceRecord ar " +
            "WHERE ar.session.date BETWEEN :startDate AND :endDate " +
            "GROUP BY ar.status")
    List<Object[]> countByStatusForMonth(@Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    // ── C4: Total sessions count for stats ──

    @Query("SELECT COUNT(DISTINCT s.id) FROM ClassSession s " +
            "WHERE s.classEntity.id = :classId " +
            "AND s.date BETWEEN :startDate AND :endDate")
    long countSessionsForClassAndMonth(@Param("classId") Long classId,
                                       @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(DISTINCT s.id) FROM ClassSession s " +
            "WHERE s.date BETWEEN :startDate AND :endDate")
    long countSessionsForMonth(@Param("startDate") LocalDate startDate,
                               @Param("endDate") LocalDate endDate);

    // ── C4b: Distinct student count for stats ──

    @Query("SELECT COUNT(DISTINCT ar.student.id) FROM AttendanceRecord ar " +
            "WHERE ar.session.classEntity.id = :classId " +
            "AND ar.session.date BETWEEN :startDate AND :endDate")
    long countDistinctStudentsForClassAndMonth(@Param("classId") Long classId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(DISTINCT ar.student.id) FROM AttendanceRecord ar " +
            "WHERE ar.session.date BETWEEN :startDate AND :endDate")
    long countDistinctStudentsForMonth(@Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);

    // ── C4c: Today's present count for stats card ──

    @Query("SELECT COUNT(DISTINCT ar.student.id) FROM AttendanceRecord ar " +
            "WHERE ar.session.date = :today " +
            "AND ar.status IN (com.meilearning.backend.entity.enums.AttendanceStatus.present, " +
            "com.meilearning.backend.entity.enums.AttendanceStatus.late)")
    long countPresentToday(@Param("today") LocalDate today);

    // ── C5: Batch query for tuition breakdown — eliminates N+1 in TuitionService ──

    @Query("SELECT ar FROM AttendanceRecord ar " +
            "WHERE ar.student.id = :studentId " +
            "AND ar.session.classEntity.id = :classId " +
            "AND ar.session.date BETWEEN :startDate AND :endDate")
    List<AttendanceRecord> findByStudentAndClassAndDateRange(
            @Param("studentId") Long studentId,
            @Param("classId") Long classId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // ── Student: filtered by class ──

    List<AttendanceRecord> findByStudentIdAndSessionClassEntityId(Long studentId, Long classId);

    // ── Log Điểm Danh Bất Thường (Activity Feed) ──

    @Query("SELECT ar FROM AttendanceRecord ar " +
           "JOIN FETCH ar.student " +
           "JOIN FETCH ar.session s " +
           "JOIN FETCH s.classEntity " +
           "WHERE ar.status IN (:statuses) " +
           "AND s.date = :today " +
           "ORDER BY ar.createdAt DESC")
    List<AttendanceRecord> findUnusualActivityToday(
            @Param("statuses") List<AttendanceStatus> statuses,
            @Param("today") LocalDate today,
            org.springframework.data.domain.Pageable pageable);
}

