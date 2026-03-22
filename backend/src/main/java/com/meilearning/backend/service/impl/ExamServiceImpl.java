package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.request.CreateExamRequest;
import com.meilearning.backend.dto.request.SubmitExamResultRequest;
import com.meilearning.backend.dto.request.UpdateExamRequest;
import com.meilearning.backend.dto.response.ExamAnswerDetailResponse;
import com.meilearning.backend.dto.response.ExamResponse;
import com.meilearning.backend.dto.response.ExamResultResponse;
import com.meilearning.backend.dto.response.ExamStatisticsResponse;
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
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final ExamResultRepository resultRepository;
    private final ExamQuestionRepository questionRepository;
    private final ExamAnswerDetailRepository answerDetailRepository;
    private final TeacherRepository teacherRepository;
    private final ClassRepository classRepository;
    private final StudentRepository studentRepository;
    private final AcademicMapper mapper;
    private final NotificationDispatcher notificationDispatcher;
    private final ClassEnrollmentRepository enrollmentRepository;

    @Override
    public ExamResponse create(CreateExamRequest req) {

        // Controller đã resolve teacher từ JWT → req.getTeacherId() = teachers.id (entity PK)
        Teacher teacher = teacherRepository.findById(req.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + req.getTeacherId()));

        Exam exam = Exam.builder()
                .teacher(teacher)
                .title(req.getTitle())
                .subject(req.getSubject())
                .duration(req.getDuration())
                .totalQuestions(req.getTotalQuestions() != null ? req.getTotalQuestions() : 0)
                .startTime(parseFlexibleInstant(req.getStartTime()))
                .endTime(parseFlexibleInstant(req.getEndTime()))
                .build();

        if (req.getClassIds() != null) {
            List<ClassEntity> classes = classRepository.findAllById(req.getClassIds());
            exam.setClasses(classes);
        }

        // Build questions vào collection trước khi save
        // → CascadeType.ALL sẽ tự persist questions cùng exam
        if (req.getQuestions() != null && !req.getQuestions().isEmpty()) {
            final java.util.concurrent.atomic.AtomicInteger idx = new java.util.concurrent.atomic.AtomicInteger(1);
            for (var qr : req.getQuestions()) {
                ExamQuestion q = new ExamQuestion();
                q.setExam(exam);
                q.setOrderIndex(idx.getAndIncrement());
                q.setType(qr.getType() != null ? qr.getType() : "multiple-choice");
                q.setQuestionText(qr.getQuestion());
                q.setOptions(qr.getOptions());
                q.setCorrectAnswer(qr.getCorrectAnswer());
                q.setPoints(qr.getPoints() != null ? qr.getPoints() : 1);
                q.setExplanation(qr.getExplanation());
                exam.getQuestions().add(q);
            }
            exam.setTotalQuestions(exam.getQuestions().size());
        }

        // Save 1 lần duy nhất — cascade persist questions
        exam = examRepository.save(exam);

        return mapper.toExamResponse(exam, 0, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public ExamResponse getById(Long id) {
        Exam exam = findExam(id);
        int count = (int) resultRepository.countByExamId(exam.getId());
        double avg = count > 0 ? resultRepository.averageScoreByExamId(exam.getId()) : 0;
        return mapper.toExamResponseWithQuestions(exam, count, avg);
    }

    @Override
    @Transactional(readOnly = true)
    public ExamResponse getByIdForStudent(Long id) {
        Exam exam = findExam(id);
        int count = (int) resultRepository.countByExamId(exam.getId());
        double avg = count > 0 ? resultRepository.averageScoreByExamId(exam.getId()) : 0;
        return mapper.toExamResponseForStudent(exam, count, avg);
    }

    @Override
    public ExamResponse update(Long id, UpdateExamRequest req) {
        Exam exam = findExam(id);
        boolean isDraft = exam.getStatus() == ExamStatus.draft;

        if (req.getTitle() != null) exam.setTitle(req.getTitle());
        if (req.getDuration() != null) exam.setDuration(req.getDuration());
        if (req.getStartTime() != null) exam.setStartTime(parseFlexibleInstant(req.getStartTime()));
        if (req.getEndTime() != null) exam.setEndTime(parseFlexibleInstant(req.getEndTime()));

        // Questions & classes chỉ được update khi còn là draft
        if (isDraft) {
            if (req.getClassIds() != null) {
                exam.setClasses(classRepository.findAllById(req.getClassIds()));
            }
            if (req.getQuestions() != null) {
                // Dùng collection clear → orphanRemoval = true sẽ DELETE
                exam.getQuestions().clear();

                final java.util.concurrent.atomic.AtomicInteger idx = new java.util.concurrent.atomic.AtomicInteger(1);
                for (var qr : req.getQuestions()) {
                    ExamQuestion q = new ExamQuestion();
                    q.setExam(exam);
                    q.setOrderIndex(idx.getAndIncrement());
                    q.setType(qr.getType() != null ? qr.getType() : "multiple-choice");
                    q.setQuestionText(qr.getQuestion());
                    q.setOptions(qr.getOptions());
                    q.setCorrectAnswer(qr.getCorrectAnswer());
                    q.setPoints(qr.getPoints() != null ? qr.getPoints() : 1);
                    q.setExplanation(qr.getExplanation());
                    exam.getQuestions().add(q);
                }
                exam.setTotalQuestions(exam.getQuestions().size());
            }
        }

        exam = examRepository.save(exam);
        int count = (int) resultRepository.countByExamId(exam.getId());
        double avg = count > 0 ? resultRepository.averageScoreByExamId(exam.getId()) : 0;
        return mapper.toExamResponseWithQuestions(exam, count, avg);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ExamResponse> getAll(Long teacherId, List<Long> studentClassIds,
                                             String status, int page, int limit) {
        if (page < 1) page = 1;
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Specification<Exam> spec = SpecHelper.empty();
        if (teacherId != null) {
            // Controller đã resolve từ JWT → teacherId = teachers.id (entity PK)
            spec = spec.and((root, q, cb) -> cb.equal(root.get("teacher").get("id"), teacherId));
        }
        if (studentClassIds != null) {
            // Student: chỉ thấy exam đã published + thuộc lớp đã đăng ký
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), ExamStatus.published));
            if (studentClassIds.isEmpty()) {
                // Chưa enroll lớp nào → trả rỗng
                spec = spec.and((root, q, cb) -> cb.literal(false).isNotNull());
            } else {
                spec = spec.and((root, q, cb) -> {
                    q.distinct(true); // tránh duplicate khi join ManyToMany
                    return root.join("classes").get("id").in(studentClassIds);
                });
            }
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

    /**
     * Submit exam — Backend chấm điểm + lưu chi tiết từng câu.
     *
     * Nếu request có `answers` (danh sách câu trả lời chi tiết):
     *   → Backend tự chấm điểm, lưu ExamAnswerDetail cho từng câu.
     * Nếu không có `answers` (backward-compatible):
     *   → Dùng score/correctAnswers từ request (flow cũ).
     */
    @Override
    public ExamResultResponse submit(Long examId, SubmitExamResultRequest req) {

        Exam exam = findExam(examId);

        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + req.getStudentId()));

        if (resultRepository.existsByExamIdAndStudentId(examId, req.getStudentId())) {
            throw new BusinessException("Học viên đã nộp bài cho exam này.");
        }

        BigDecimal score;
        int correctCount;
        List<ExamAnswerDetail> answerDetails = new ArrayList<>();

        if (req.getAnswers() != null && !req.getAnswers().isEmpty()) {
            // ── Chấm điểm từ chi tiết câu trả lời ──
            List<ExamQuestion> questions = questionRepository.findByExamIdOrderByOrderIndex(examId);
            Map<Long, ExamQuestion> questionMap = questions.stream()
                    .collect(Collectors.toMap(ExamQuestion::getId, q -> q));

            correctCount = 0;

            for (SubmitExamResultRequest.AnswerItem ans : req.getAnswers()) {
                ExamQuestion q = questionMap.get(ans.getQuestionId());
                if (q == null) continue;

                String correct = (q.getCorrectAnswer() != null ? q.getCorrectAnswer() : "").toLowerCase().trim();
                String selected = (ans.getSelectedAnswer() != null ? ans.getSelectedAnswer() : "").toLowerCase().trim();
                boolean isCorrect = !selected.isEmpty() && correct.equals(selected);
                if (isCorrect) correctCount++;

                answerDetails.add(ExamAnswerDetail.builder()
                        .question(q)
                        .selectedAnswer(ans.getSelectedAnswer())
                        .correctAnswer(q.getCorrectAnswer())
                        .isCorrect(isCorrect)
                        .build());
            }

            int totalQ = questions.size();
            score = totalQ > 0
                    ? BigDecimal.valueOf(correctCount * 100.0 / totalQ).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
        } else {
            // ── Backward-compatible: dùng score từ request ──
            score = req.getScore() != null ? req.getScore() : BigDecimal.ZERO;
            correctCount = req.getCorrectAnswers() != null ? req.getCorrectAnswers() : 0;
        }

        boolean passed = score.compareTo(BigDecimal.valueOf(50)) >= 0;

        ExamResult result = ExamResult.builder()
                .exam(exam)
                .student(student)
                .score(score)
                .correctAnswers(correctCount)
                .timeSpent(req.getTimeSpent())
                .passed(passed)
                .submittedAt(Instant.now())
                .build();

        result = resultRepository.save(result);

        // Lưu chi tiết câu trả lời
        if (!answerDetails.isEmpty()) {
            for (ExamAnswerDetail d : answerDetails) {
                d.setExamResult(result);
            }
            answerDetailRepository.saveAll(answerDetails);
        }

        // Notify teacher: student nộp bài
        if (exam.getTeacher() != null && exam.getTeacher().getUser() != null) {
            notificationDispatcher.notifyInApp(
                    exam.getTeacher().getUser(),
                    "exam_submission",
                    "Học viên nộp bài: " + exam.getTitle(),
                    student.getUser() != null ? student.getUser().getName() : "Học viên"
                            + " đã nộp bài kiểm tra \"" + exam.getTitle() + "\". Điểm: " + score
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

    @Override
    @Transactional(readOnly = true)
    public List<ExamAnswerDetailResponse> getStudentAnswerDetails(Long examId, Long studentId) {
        List<ExamAnswerDetail> details = answerDetailRepository
                .findByExamResultExamIdAndExamResultStudentId(examId, studentId);
        return details.stream().map(mapper::toAnswerDetailResponse).toList();
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

    @Override
    @Transactional(readOnly = true)
    public ExamStatisticsResponse getStatistics(Long examId) {
        Exam exam = findExam(examId);
        int total = (int) resultRepository.countByExamId(examId);
        double avg  = total > 0 ? resultRepository.averageScoreByExamId(examId) : 0;
        double max  = total > 0 ? resultRepository.maxScoreByExamId(examId) : 0;
        double min  = total > 0 ? resultRepository.minScoreByExamId(examId) : 0;
        long passed = resultRepository.countByExamIdAndPassedTrue(examId);
        double passRate = total > 0 ? (double) passed / total * 100 : 0;

        return ExamStatisticsResponse.builder()
                .examId(examId)
                .examTitle(exam.getTitle())
                .totalSubmissions(total)
                .avgScore(Math.round(avg * 100.0) / 100.0)
                .passRate(Math.round(passRate * 100.0) / 100.0)
                .maxScore(max)
                .minScore(min)
                .totalQuestions(exam.getTotalQuestions() != null ? exam.getTotalQuestions() : 0)
                .duration(exam.getDuration() != null ? exam.getDuration() : 0)
                .build();
    }

    @Override
    public ExamResponse archive(Long id) {
        Exam exam = findExam(id);
        if (exam.getStatus() == ExamStatus.draft) {
            throw new com.meilearning.backend.exception.BusinessException(
                    "Chỉ có thể lưu trữ bài thi đã published.");
        }
        exam.setStatus(ExamStatus.archived);
        exam = examRepository.save(exam);
        return toResponseWithStats(exam);
    }


    /**
     * Parse datetime string linh hoạt:
     *  - "2026-03-20T10:00"       → từ datetime-local input (browser)
     *  - "2026-03-20T10:00:00"    → ISO-8601 không có timezone
     *  - "2026-03-20T10:00:00Z"   → ISO-8601 đầy đủ
     */
    private Instant parseFlexibleInstant(String text) {
        if (text == null || text.isBlank()) return null;
        try {
            return Instant.parse(text);
        } catch (Exception e) {
            // datetime-local format: "2026-03-20T10:00" hoặc "2026-03-20T10:00:00"
            return LocalDateTime.parse(text).toInstant(ZoneOffset.UTC);
        }
    }

}
