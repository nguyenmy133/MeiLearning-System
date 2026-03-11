package meilearning.com.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import meilearning.com.backend.entity.ClassEnrollment;

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
}
