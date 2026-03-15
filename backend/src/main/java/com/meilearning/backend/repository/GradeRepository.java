package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.Grade;
import java.util.List;
import java.util.Optional;
@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {

    List<Grade> findByStudentId(Long studentId);

    List<Grade> findByClassEntityId(Long classId);

    Optional<Grade> findByStudentIdAndClassEntityId(Long studentId, Long classId);

    boolean existsByStudentIdAndClassEntityId(Long studentId, Long classId);

}
