package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.Exam;
import com.meilearning.backend.entity.enums.ExamStatus;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long>, JpaSpecificationExecutor<Exam> {

    List<Exam> findByTeacherId(Long teacherId);

    List<Exam> findByStatus(ExamStatus status);

    List<Exam> findByTeacherIdAndStatus(Long teacherId, ExamStatus status);

    long countByStatus(ExamStatus status);

    long countByTeacherId(Long teacherId);
}
