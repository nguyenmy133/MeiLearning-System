package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.ClassEnrollment;
import java.util.List;
import java.util.Optional;
@Repository
public interface ClassEnrollmentRepository extends JpaRepository<ClassEnrollment, Long> {

    List<ClassEnrollment> findByStudentId(Long studentId);

    List<ClassEnrollment> findByClassEntityId(Long classId);

    Optional<ClassEnrollment> findByStudentIdAndClassEntityId(Long studentId, Long classId);

    boolean existsByStudentIdAndClassEntityId(Long studentId, Long classId);

    long countByClassEntityId(Long classId);

    void deleteByStudentIdAndClassEntityId(Long studentId, Long classId);

    // ── Reports queries ──────────────────────────────────────────────

    /** Số học viên theo môn (qua class → subject) */
    @org.springframework.data.jpa.repository.Query(
        "SELECT ce.classEntity.subject.name, COUNT(DISTINCT ce.student.id) " +
        "FROM ClassEnrollment ce " +
        "WHERE ce.classEntity.status IN (com.meilearning.backend.entity.enums.ClassStatus.active, com.meilearning.backend.entity.enums.ClassStatus.upcoming) " +
        "AND ce.student.status = com.meilearning.backend.entity.enums.StudentStatus.active " +
        "GROUP BY ce.classEntity.subject.name"
    )
    java.util.List<Object[]> countStudentsBySubject();

    /** Lấy enrollments của học viên active — dùng khi generate hóa đơn hàng loạt */
    @org.springframework.data.jpa.repository.Query(
        "SELECT e FROM ClassEnrollment e " +
        "JOIN FETCH e.student s " +
        "JOIN FETCH s.user " +
        "JOIN FETCH e.classEntity c " +
        "WHERE s.status = com.meilearning.backend.entity.enums.StudentStatus.active"
    )
    java.util.List<ClassEnrollment> findActiveEnrollments();

}
