package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.ExamResult;
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

    @Query("SELECT COALESCE(MAX(er.score), 0) FROM ExamResult er WHERE er.exam.id = :examId")
    double maxScoreByExamId(Long examId);

    @Query("SELECT COALESCE(MIN(er.score), 0) FROM ExamResult er WHERE er.exam.id = :examId")
    double minScoreByExamId(Long examId);

    /**
     * Lấy exam results của 1 student trong 1 class cụ thể.
     * Join qua bảng exam_classes (Exam.classes M:N ClassEntity).
     */
    @Query("SELECT er FROM ExamResult er " +
           "JOIN er.exam e " +
           "JOIN e.classes c " +
           "WHERE er.student.id = :studentId AND c.id = :classId " +
           "ORDER BY e.endTime ASC")
    List<ExamResult> findByStudentIdAndClassId(
            @Param("studentId") Long studentId,
            @Param("classId") Long classId);

}

