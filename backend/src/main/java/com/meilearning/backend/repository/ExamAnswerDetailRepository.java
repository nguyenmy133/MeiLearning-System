package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.ExamAnswerDetail;
import java.util.List;

@Repository
public interface ExamAnswerDetailRepository extends JpaRepository<ExamAnswerDetail, Long> {

    List<ExamAnswerDetail> findByExamResultId(Long examResultId);

    List<ExamAnswerDetail> findByExamResultExamIdAndExamResultStudentId(Long examId, Long studentId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(ead) FROM ExamAnswerDetail ead " +
        "WHERE ead.question.exam.teacher.id = :teacherId " +
        "AND ead.question.type = 'essay' " +
        "AND ead.selectedAnswer IS NOT NULL AND ead.selectedAnswer != '' " +
        "AND ead.essayScore IS NULL"
    )
    long countUngradedEssaysByTeacher(@org.springframework.data.repository.query.Param("teacherId") Long teacherId);
}
