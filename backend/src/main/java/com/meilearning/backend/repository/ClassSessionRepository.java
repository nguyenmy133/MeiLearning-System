package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.ClassSession;
import com.meilearning.backend.entity.enums.SessionStatus;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ClassSessionRepository
        extends JpaRepository<ClassSession, Long>, JpaSpecificationExecutor<ClassSession> {

    List<ClassSession> findByClassEntityId(Long classId);

    List<ClassSession> findByDate(LocalDate date);

    List<ClassSession> findByDateBetween(LocalDate startDate, LocalDate endDate);

    List<ClassSession> findByClassEntityIdAndDate(Long classId, LocalDate date);

    List<ClassSession> findByClassEntityIdAndDateBetween(Long classId, LocalDate startDate, LocalDate endDate);

    List<ClassSession> findByStatus(SessionStatus status);

    long countByClassEntityId(Long classId);

    long countByClassEntityIdAndStatus(Long classId, SessionStatus status);

    /** Láº¥y sessions cá»§a 1 teacher theo ngĂ y (thĂ´ng qua Class â†’ Teacher) */
    List<ClassSession> findByClassEntityTeacherIdAndDate(Long teacherId, LocalDate date);

    /** Láº¥y sessions cá»§a 1 teacher trong tuáº§n */
    List<ClassSession> findByClassEntityTeacherIdAndDateBetween(Long teacherId, LocalDate startDate, LocalDate endDate);
}
