package meilearning.com.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import meilearning.com.backend.entity.ExamResult;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {

    List<ExamResult> findByExamId(Long examId);

    List<ExamResult> findByStudentId(Long studentId);

    Optional<ExamResult> findByExamIdAndStudentId(Long examId, Long studentId);

    boolean existsByExamIdAndStudentId(Long examId, Long studentId);

    long countByExamId(Long examId);

    long countByExamIdAndPassedTrue(Long examId);

    @Query("SELECT COALESCE(AVG(er.score), 0) FROM ExamResult er WHERE er.exam.id = :examId")
    double averageScoreByExamId(Long examId);

    @Query("SELECT COALESCE(AVG(er.timeSpent), 0) FROM ExamResult er WHERE er.exam.id = :examId")
    double averageTimeSpentByExamId(Long examId);
}
