package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.ExamAnswerDetail;
import java.util.List;

@Repository
public interface ExamAnswerDetailRepository extends JpaRepository<ExamAnswerDetail, Long> {

    List<ExamAnswerDetail> findByExamResultId(Long examResultId);

    List<ExamAnswerDetail> findByExamResultExamIdAndExamResultStudentId(Long examId, Long studentId);
}
