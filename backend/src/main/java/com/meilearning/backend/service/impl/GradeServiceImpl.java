package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.meilearning.backend.dto.request.UpdateGradeRequest;
import com.meilearning.backend.dto.response.GradeResponse;
import com.meilearning.backend.entity.*;
import com.meilearning.backend.entity.enums.GradeTrend;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.mapper.AcademicMapper;
import com.meilearning.backend.repository.*;
import com.meilearning.backend.service.GradeService;
import com.meilearning.backend.service.NotificationDispatcher;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class GradeServiceImpl implements GradeService {

    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final AcademicMapper mapper;
    private final NotificationDispatcher notificationDispatcher;

    @Override
    @Transactional(readOnly = true)
    public List<GradeResponse> getByClass(Long classId) {
        return gradeRepository.findByClassEntityId(classId).stream()
                .map(mapper::toGradeResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<GradeResponse> getByStudent(Long studentId) {
        return gradeRepository.findByStudentId(studentId).stream()
                .map(mapper::toGradeResponse).toList();
    }

    @Override
    public GradeResponse update(UpdateGradeRequest req) {
        // Upsert
        Grade grade = gradeRepository.findByStudentIdAndClassEntityId(req.getStudentId(), req.getClassId())
                .orElseGet(() -> {
                    Student student = studentRepository.findById(req.getStudentId())
                            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
                    ClassEntity classEntity = classRepository.findById(req.getClassId())
                            .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
                    return Grade.builder().student(student).classEntity(classEntity).build();
                });

        if (req.getAvgScore() != null) grade.setAvgScore(req.getAvgScore());
        if (req.getTrend() != null) grade.setTrend(GradeTrend.valueOf(req.getTrend()));
        if (req.getAttendanceRate() != null) grade.setAttendanceRate(req.getAttendanceRate());
        if (req.getComment() != null) {
            grade.setComment(req.getComment());
            grade.setCommentUpdatedAt(Instant.now());
        }

        grade = gradeRepository.save(grade);

        // Gửi thông báo cập nhật điểm (MEDIUM: In-App + Email)
        if (grade.getStudent() != null && grade.getStudent().getUser() != null) {
            String className = grade.getClassEntity() != null
                    ? grade.getClassEntity().getName() : "";
            notificationDispatcher.notifyWithEmail(
                    grade.getStudent().getUser(),
                    "grade",
                    "Cập nhật điểm",
                    "Điểm của bạn trong lớp " + className + " đã được cập nhật."
                            + (grade.getAvgScore() != null ? " Điểm TB: " + grade.getAvgScore() : "")
            );
        }

        return mapper.toGradeResponse(grade);
    }
}
