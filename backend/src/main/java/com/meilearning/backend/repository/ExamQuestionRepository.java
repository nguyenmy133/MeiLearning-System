package com.meilearning.backend.repository;

import com.meilearning.backend.entity.ExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Long> {
    List<ExamQuestion> findByExamIdOrderByOrderIndex(Long examId);
    void deleteByExamId(Long examId);
}
