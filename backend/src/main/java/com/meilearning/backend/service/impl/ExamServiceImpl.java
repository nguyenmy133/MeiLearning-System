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
import com.meilearning.backend.service.NotificationDispatcher;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.util.SpecHelper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
    private final NotificationDispatcher notificationDispatcher;
    private final ClassEnrollmentRepository enrollmentRepository;

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
    public PageResponse<ExamResponse> getAll(Long teacherId, String status, int page, int limit) {
        if (page < 1) page = 1;
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Specification<Exam> spec = SpecHelper.empty();
        if (teacherId != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("teacher").get("id"), teacherId));
        }
        if (status != null && !status.isBlank()) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), ExamStatus.valueOf(status)));
        }
        Page<Exam> result = examRepository.findAll(spec, pageable);
        return PageResponse.<ExamResponse>builder()
                .data(result.getContent().stream().map(this::toResponseWithStats).toList())
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(result.getTotalPages())
                .build();
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
            throw new BusinessException("Chỉ publish exam đang ở trạng thái draft.");

        }

        exam.setStatus(ExamStatus.published);

        final Exam savedExam = examRepository.save(exam);

        // Notify all students in the exam's classes
        if (savedExam.getClasses() != null) {
            for (ClassEntity cls : savedExam.getClasses()) {
                enrollmentRepository.findByClassEntityId(cls.getId())
                        .forEach(enrollment -> {
                            if (enrollment.getStudent() != null && enrollment.getStudent().getUser() != null) {
                                notificationDispatcher.notifyWithEmail(
                                        enrollment.getStudent().getUser(),
                                        "exam",
                                        "Bài kiểm tra mới: " + savedExam.getTitle(),
                                        "Bài kiểm tra \"" + savedExam.getTitle() + "\" môn " + savedExam.getSubject()
                                                + " đã được publish. Vui lòng kiểm tra và làm bài."
                                );
                            }
                        });
            }
        }

        return toResponseWithStats(savedExam);

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
            throw new BusinessException("Học viên đã nộp bài cho exam này.");

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

        // Notify teacher: student nộp bài
        if (exam.getTeacher() != null && exam.getTeacher().getUser() != null) {
            notificationDispatcher.notifyInApp(
                    exam.getTeacher().getUser(),
                    "exam_submission",
                    "Học viên nộp bài: " + exam.getTitle(),
                    student.getUser() != null ? student.getUser().getName() : "Học viên"
                            + " đã nộp bài kiểm tra \"" + exam.getTitle() + "\". Điểm: " + req.getScore()
            );
        }

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
                .orElseThrow(() -> new ResourceNotFoundException("Chưa có kết quả cho exam " + examId));

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
