package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.meilearning.backend.dto.request.CreateExamRequest;
import com.meilearning.backend.dto.request.SubmitExamResultRequest;
import com.meilearning.backend.dto.response.ExamResponse;
import com.meilearning.backend.dto.response.ExamResultResponse;
import com.meilearning.backend.entity.*;
import com.meilearning.backend.entity.enums.ExamStatus;
import com.meilearning.backend.exception.BusinessException;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.mapper.AcademicMapper;
import com.meilearning.backend.repository.*;
import com.meilearning.backend.service.ExamService;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final ExamResultRepository resultRepository;
    private final TeacherRepository teacherRepository;
    private final ClassRepository classRepository;
    private final StudentRepository studentRepository;
    private final AcademicMapper mapper;

    @Override
    public ExamResponse create(CreateExamRequest req) {
        Teacher teacher = teacherRepository.findById(req.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + req.getTeacherId()));

        Exam exam = Exam.builder()
                .teacher(teacher)
                .title(req.getTitle())
                .subject(req.getSubject())
                .duration(req.getDuration())
                .totalQuestions(req.getTotalQuestions() != null ? req.getTotalQuestions() : 0)
                .startTime(req.getStartTime() != null ? Instant.parse(req.getStartTime()) : null)
                .endTime(req.getEndTime() != null ? Instant.parse(req.getEndTime()) : null)
                .build();

        if (req.getClassIds() != null) {
            List<ClassEntity> classes = classRepository.findAllById(req.getClassIds());
            exam.setClasses(classes);
        }

        exam = examRepository.save(exam);
        return mapper.toExamResponse(exam, 0, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public ExamResponse getById(Long id) {
        Exam exam = findExam(id);
        return toResponseWithStats(exam);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResponse> getAll(Long teacherId, String status) {
        List<Exam> exams;
        if (teacherId != null && status != null) {
            exams = examRepository.findByTeacherIdAndStatus(teacherId, ExamStatus.valueOf(status));
        } else if (teacherId != null) {
            exams = examRepository.findByTeacherId(teacherId);
        } else if (status != null) {
            exams = examRepository.findByStatus(ExamStatus.valueOf(status));
        } else {
            exams = examRepository.findAll();
        }
        return exams.stream().map(this::toResponseWithStats).toList();
    }

    @Override
    public ExamResponse publish(Long id) {
        Exam exam = findExam(id);
        if (exam.getStatus() != ExamStatus.draft) {
            throw new BusinessException("Chá»‰ publish exam Ä‘ang á»Ÿ tráº¡ng thĂ¡i draft.");
        }
        exam.setStatus(ExamStatus.published);
        exam = examRepository.save(exam);
        return toResponseWithStats(exam);
    }

    @Override
    public void delete(Long id) {
        Exam exam = findExam(id);
        examRepository.delete(exam);
    }

    @Override
    public ExamResultResponse submit(Long examId, SubmitExamResultRequest req) {
        Exam exam = findExam(examId);
        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + req.getStudentId()));

        if (resultRepository.existsByExamIdAndStudentId(examId, req.getStudentId())) {
            throw new BusinessException("Há»c viĂªn Ä‘Ă£ ná»™p bĂ i cho exam nĂ y.");
        }

        boolean passed = req.getScore().compareTo(BigDecimal.valueOf(50)) >= 0;

        ExamResult result = ExamResult.builder()
                .exam(exam)
                .student(student)
                .score(req.getScore())
                .correctAnswers(req.getCorrectAnswers() != null ? req.getCorrectAnswers() : 0)
                .timeSpent(req.getTimeSpent())
                .passed(passed)
                .submittedAt(Instant.now())
                .build();

        result = resultRepository.save(result);
        return mapper.toResultResponse(result);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResultResponse> getResults(Long examId) {
        return resultRepository.findByExamId(examId).stream()
                .map(mapper::toResultResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ExamResultResponse getStudentResult(Long examId, Long studentId) {
        ExamResult result = resultRepository.findByExamIdAndStudentId(examId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("ChÆ°a cĂ³ káº¿t quáº£ cho exam " + examId));
        return mapper.toResultResponse(result);
    }

    private Exam findExam(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found: " + id));
    }

    private ExamResponse toResponseWithStats(Exam exam) {
        int count = (int) resultRepository.countByExamId(exam.getId());
        double avg = count > 0 ? resultRepository.averageScoreByExamId(exam.getId()) : 0;
        return mapper.toExamResponse(exam, count, avg);
    }
}
