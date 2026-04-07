package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.request.CreateExamRequest;
import com.meilearning.backend.dto.request.GradeEssayRequest;
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
                .maxAttempts(req.getMaxAttempts() != null ? req.getMaxAttempts() : 1)
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
            buildQuestions(exam, req.getQuestions());
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
        if (req.getMaxAttempts() != null) exam.setMaxAttempts(req.getMaxAttempts());

        // Questions & classes chỉ được update khi còn là draft
        if (isDraft) {
            if (req.getClassIds() != null) {
                exam.setClasses(classRepository.findAllById(req.getClassIds()));
            }
            if (req.getQuestions() != null) {
                // Dùng collection clear → orphanRemoval = true sẽ DELETE
                exam.getQuestions().clear();
                buildQuestions(exam, req.getQuestions());
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
                                             Long currentStudentId, String status, int page, int limit) {
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
        // Status filter: "draft"/"archived" are stored in DB → filter at DB level
        // "ongoing"/"ended"/"published" are computed dynamically → post-filter
        String requestedStatus = (status != null && !status.isBlank()) ? status : null;
        if (requestedStatus != null) {
            if ("draft".equals(requestedStatus) || "archived".equals(requestedStatus)) {
                spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), ExamStatus.valueOf(requestedStatus)));
            } else {
                // "ongoing"/"ended"/"published" all come from DB status = published
                spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), ExamStatus.published));
            }
        }
        Page<Exam> result = examRepository.findAll(spec, pageable);
        List<ExamResponse> responses = result.getContent().stream().map(this::toResponseWithStats).toList();

        // Post-filter by dynamic status (ongoing/ended/published)
        if (requestedStatus != null && !"draft".equals(requestedStatus) && !"archived".equals(requestedStatus)) {
            responses = responses.stream()
                    .filter(r -> requestedStatus.equals(r.getStatus()))
                    .toList();
        }

        // Enrich with student-specific result data
        if (currentStudentId != null && !responses.isEmpty()) {
            List<ExamResult> studentResults = resultRepository.findByStudentId(currentStudentId);
            // Build map: examId → ExamResult
            java.util.Map<Long, ExamResult> resultMap = new java.util.HashMap<>();
            for (ExamResult er : studentResults) {
                resultMap.put(er.getExam().getId(), er);
            }
            for (ExamResponse resp : responses) {
                ExamResult er = resultMap.get(resp.getId());
                if (er != null) {
                    resp.setMySubmittedAt(er.getSubmittedAt() != null ? er.getSubmittedAt().toString() : null);
                    resp.setMyScore(er.getScore() != null ? er.getScore().doubleValue() : null);
                    resp.setMyPassed(er.getPassed());
                    resp.setMyTimeSpent(er.getTimeSpent());
                    String gradingStatus = com.meilearning.backend.mapper.AcademicMapper
                            .computeGradingStatus(er.getAnswerDetails());
                    resp.setMyGradingStatus(gradingStatus);
                    resp.setMyScoreHistory(er.getScoreHistory());
                }
                resp.setMyDurationMinutes(resp.getDuration());
            }
        }

        return PageResponse.<ExamResponse>builder()
                .data(responses)
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(result.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ExamResponse> getAllForCurrentUser(String status, int page, int limit) {
        Long teacherId = null;
        List<Long> studentClassIds = null;
        Long currentStudentId = null;

        if (com.meilearning.backend.util.SecurityUtils.isStudent()
                && !com.meilearning.backend.util.SecurityUtils.isAdmin()) {
            Student student = com.meilearning.backend.util.SecurityUtils.getCurrentStudent(studentRepository);
            currentStudentId = student.getId();
            studentClassIds = enrollmentRepository.findByStudentId(student.getId())
                    .stream().map(e -> e.getClassEntity().getId()).toList();
        } else if (com.meilearning.backend.util.SecurityUtils.isTeacher()
                && !com.meilearning.backend.util.SecurityUtils.isAdmin()) {
            Teacher teacher = com.meilearning.backend.util.SecurityUtils.getCurrentTeacher(teacherRepository);
            teacherId = teacher.getId();
        }

        return getAll(teacherId, studentClassIds, currentStudentId, status, page, limit);
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

        ExamResult existingResult = resultRepository.findByExamIdAndStudentId(examId, req.getStudentId()).orElse(null);
        String newHistory = null;
        if (existingResult != null) {
            int attempts = existingResult.getScoreHistory() == null ? 1 : existingResult.getScoreHistory().split(",").length + 1;
            int maxAttemptsAllowed = exam.getMaxAttempts() != null ? exam.getMaxAttempts() : 1;
            if (attempts >= maxAttemptsAllowed) {
                throw new BusinessException("Học viên đã nộp bài và vượt quá số lần cho phép (" + maxAttemptsAllowed + " lần).");
            }
            String oldScoreStr = "Lần " + attempts + ": " + existingResult.getScore() + "đ";
            newHistory = existingResult.getScoreHistory() == null ? oldScoreStr : existingResult.getScoreHistory() + ", " + oldScoreStr;
            
            // Xóa chi tiết lời giải cũ để ghi đè
            if (existingResult.getAnswerDetails() != null && !existingResult.getAnswerDetails().isEmpty()) {
                answerDetailRepository.deleteAll(existingResult.getAnswerDetails());
                existingResult.getAnswerDetails().clear();
            }
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

                boolean isEssay = "essay".equals(q.getType());

                if (isEssay) {
                    // Essay: lưu text answer, chờ teacher chấm tay
                    answerDetails.add(ExamAnswerDetail.builder()
                            .question(q)
                            .selectedAnswer(ans.getSelectedAnswer())
                            .correctAnswer(null) // essay không có đáp án cố định
                            .isCorrect(false)    // pending manual grading
                            .build());
                } else {
                    // Multiple-choice: chấm tự động
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
            }

            // Tính điểm dựa trên câu ĐÃ CHẤM (MC only trên lần nộp đầu)
            // Essay chưa chấm KHÔNG tham gia vào cả tử số và mẫu số.
            // Khi teacher chấm essay → gradeEssay() sẽ tính lại trên ALL questions.
            int totalPoints = 0;
            int earnedPoints = 0;
            for (ExamQuestion q : questions) {
                if ("essay".equals(q.getType())) continue; // skip essay
                int pts = q.getPoints() != null ? q.getPoints() : 1;
                totalPoints += pts;
            }
            for (ExamAnswerDetail d : answerDetails) {
                if (Boolean.TRUE.equals(d.getIsCorrect())) {
                    int pts = d.getQuestion().getPoints() != null ? d.getQuestion().getPoints() : 1;
                    earnedPoints += pts;
                }
            }
            score = totalPoints > 0
                    ? BigDecimal.valueOf(earnedPoints * 100.0 / totalPoints).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
        } else {
            // ── Backward-compatible: dùng score từ request ──
            score = req.getScore() != null ? req.getScore() : BigDecimal.ZERO;
            correctCount = req.getCorrectAnswers() != null ? req.getCorrectAnswers() : 0;
        }

        boolean passed = score.compareTo(com.meilearning.backend.util.BusinessConstants.PASSING_SCORE) >= 0;

        ExamResult result = existingResult != null ? existingResult : new ExamResult();
        result.setExam(exam);
        result.setStudent(student);
        result.setScore(score);
        result.setCorrectAnswers(correctCount);
        result.setTimeSpent(req.getTimeSpent());
        result.setPassed(passed);
        result.setSubmittedAt(Instant.now());
        if (newHistory != null) {
            result.setScoreHistory(newHistory);
        }

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

    /**
     * Build ExamQuestion entities từ request list vào exam.questions collection.
     * Validate MC questions phải có correctAnswer.
     */
    private void buildQuestions(Exam exam, List<com.meilearning.backend.dto.request.QuestionRequest> requests) {
        final java.util.concurrent.atomic.AtomicInteger idx = new java.util.concurrent.atomic.AtomicInteger(1);
        for (var qr : requests) {
            if ("multiple-choice".equals(qr.getType())
                    && (qr.getCorrectAnswer() == null || qr.getCorrectAnswer().isBlank())) {
                throw new BusinessException("Câu hỏi trắc nghiệm \"" + qr.getQuestion()
                        + "\" chưa chọn đáp án đúng.");
            }
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

    @Override
    @Transactional
    public void gradeEssay(Long examId, Long studentId, GradeEssayRequest request) {
        // 1. Tìm ExamResult
        ExamResult examResult = resultRepository.findByExamIdAndStudentId(examId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy kết quả bài thi cho exam=" + examId + ", student=" + studentId));

        // 2. Lấy tất cả answer details
        List<ExamAnswerDetail> allDetails =
                answerDetailRepository.findByExamResultId(examResult.getId());
        Map<Long, ExamAnswerDetail> detailMap = allDetails.stream()
                .collect(Collectors.toMap(ExamAnswerDetail::getId, d -> d));

        // 3. Cập nhật điểm + nhận xét cho từng câu essay
        for (GradeEssayRequest.EssayGradeItem item : request.getGrades()) {
            ExamAnswerDetail detail = detailMap.get(item.getAnswerDetailId());
            if (detail == null) continue;

            // Validate score against question's max points
            int maxPts = detail.getQuestion().getPoints() != null ? detail.getQuestion().getPoints() : 1;
            if (item.getScore() != null && (item.getScore() < 0 || item.getScore() > maxPts)) {
                throw new BusinessException("Điểm câu " + detail.getQuestion().getOrderIndex()
                        + " phải từ 0 đến " + maxPts);
            }

            detail.setEssayScore(item.getScore());
            detail.setTeacherComment(item.getComment());
            // isCorrect = score > 0 (đã chấm và có điểm)
            detail.setIsCorrect(item.getScore() != null && item.getScore() > 0);
        }
        answerDetailRepository.saveAll(allDetails);

        // 4. Tính lại tổng điểm: (mcEarned + essayEarned) / totalPoints × 100
        List<ExamQuestion> questions = questionRepository.findByExamIdOrderByOrderIndex(examId);
        Map<Long, ExamQuestion> questionMap = questions.stream()
                .collect(Collectors.toMap(ExamQuestion::getId, q -> q));

        int totalPoints = 0;
        int earnedPoints = 0;

        for (ExamAnswerDetail detail : allDetails) {
            ExamQuestion q = questionMap.get(detail.getQuestion().getId());
            if (q == null) continue;
            int pts = q.getPoints() != null ? q.getPoints() : 1;
            totalPoints += pts;

            if ("essay".equals(q.getType())) {
                // Essay: dùng essayScore (0 nếu chưa chấm)
                earnedPoints += detail.getEssayScore() != null ? detail.getEssayScore() : 0;
            } else {
                // MC: dùng isCorrect
                if (Boolean.TRUE.equals(detail.getIsCorrect())) {
                    earnedPoints += pts;
                }
            }
        }

        BigDecimal newScore = totalPoints > 0
                ? BigDecimal.valueOf(earnedPoints * 100.0 / totalPoints)
                    .setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        int correctCount = (int) allDetails.stream()
                .filter(d -> Boolean.TRUE.equals(d.getIsCorrect())).count();

        examResult.setScore(newScore);
        examResult.setCorrectAnswers(correctCount);
        examResult.setPassed(newScore.compareTo(com.meilearning.backend.util.BusinessConstants.PASSING_SCORE) >= 0);
        resultRepository.save(examResult);

        // 5. Notify student: teacher đã chấm bài tự luận
        Exam exam = examResult.getExam();
        Student student = examResult.getStudent();
        if (student != null && student.getUser() != null) {
            BigDecimal score10 = newScore.divide(BigDecimal.TEN, 1, RoundingMode.HALF_UP);
            notificationDispatcher.notifyWithEmail(
                    student.getUser(),
                    "exam_graded",
                    "Bài thi đã được chấm điểm",
                    "Giáo viên đã chấm bài tự luận cho bài thi \"" + exam.getTitle()
                            + "\". Điểm cập nhật: " + score10 + "/10."
            );
        }
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
