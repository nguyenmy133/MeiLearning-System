package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.AttendanceRecord;
import com.meilearning.backend.entity.enums.AttendanceStatus;

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
}
