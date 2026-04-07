package com.meilearning.backend.mapper;

import org.springframework.stereotype.Component;
import com.meilearning.backend.dto.response.*;
import com.meilearning.backend.entity.*;
import com.meilearning.backend.entity.enums.ExamStatus;
import java.time.Instant;
@Component
public class AcademicMapper {

    /**
     * Compute effective status based on stored status + startTime/endTime.
     * Only "published" exams get dynamic status resolution.
     */
    private String computeEffectiveStatus(Exam exam) {
        ExamStatus stored = exam.getStatus();
        // draft / archived → keep as-is
        if (stored != ExamStatus.published) {
            return stored.name();
        }
        Instant now = Instant.now();
        Instant start = exam.getStartTime();
        Instant end = exam.getEndTime();
        // Has ended?
        if (end != null && now.isAfter(end)) return "ended";
        // Is ongoing?
        if (start != null && !now.isBefore(start) && (end == null || !now.isAfter(end))) return "ongoing";
        // Not started yet → upcoming (published but scheduled for the future)
        if (start != null && now.isBefore(start)) return "upcoming";
        // Published without startTime set
        return "published";
    }

    public ExamResponse toExamResponse(Exam exam, int submittedCount, double avgScore) {
        // Count total enrolled students across all classes of this exam
        int totalStudents = exam.getClasses().stream()
                .mapToInt(c -> c.getEnrollments() != null ? c.getEnrollments().size() : 0)
                .sum();
        return ExamResponse.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .subject(exam.getSubject())
                .teacherId(exam.getTeacher().getId())
                .teacherName(exam.getTeacher().getUser().getName())
                .duration(exam.getDuration())
                .totalQuestions(exam.getTotalQuestions())
                .startTime(exam.getStartTime() != null ? exam.getStartTime().toString() : null)
                .endTime(exam.getEndTime() != null ? exam.getEndTime().toString() : null)
                .status(computeEffectiveStatus(exam))
                .classIds(exam.getClasses().stream().map(ClassEntity::getId).toList())
                .classNames(exam.getClasses().stream().map(ClassEntity::getName).toList())
                .submittedCount(submittedCount)
                .avgScore(avgScore)
                .createdAt(exam.getCreatedAt())
                .totalStudents(totalStudents)
                .maxAttempts(exam.getMaxAttempts())
                .build();
    }

    /** Dùng cho GET /exams/{id} — trả về kèm danh sách câu hỏi */
    public ExamResponse toExamResponseWithQuestions(Exam exam, int submittedCount, double avgScore) {
        ExamResponse resp = toExamResponse(exam, submittedCount, avgScore);
        resp.setQuestions(exam.getQuestions().stream().map(this::toQuestionResponse).toList());
        return resp;
    }

    public QuestionResponse toQuestionResponse(ExamQuestion q) {
        return QuestionResponse.builder()
                .id(q.getId())
                .orderIndex(q.getOrderIndex())
                .type(q.getType())
                .question(q.getQuestionText())
                .options(q.getOptions())
                .correctAnswer(q.getCorrectAnswer())
                .points(q.getPoints())
                .explanation(q.getExplanation())
                .build();
    }

    /** Student version: ẩn correctAnswer + explanation để tránh gian lận */
    public QuestionResponse toQuestionResponseForStudent(ExamQuestion q) {
        return QuestionResponse.builder()
                .id(q.getId())
                .orderIndex(q.getOrderIndex())
                .type(q.getType())
                .question(q.getQuestionText())
                .options(q.getOptions())
                .correctAnswer(null)      // ẩn đáp án
                .points(q.getPoints())
                .explanation(null)         // ẩn giải thích
                .build();
    }

    /** Dùng cho GET /exams/{id}/for-student — trả về kèm câu hỏi KHÔNG có đáp án */
    public ExamResponse toExamResponseForStudent(Exam exam, int submittedCount, double avgScore) {
        ExamResponse resp = toExamResponse(exam, submittedCount, avgScore);
        resp.setQuestions(exam.getQuestions().stream().map(this::toQuestionResponseForStudent).toList());
        return resp;
    }


    /**
     * Compute grading status from answer details — centralized logic.
     * Used by toResultResponse, toExamScoreItem, and ExamServiceImpl enrichment.
     */
    public static String computeGradingStatus(java.util.List<ExamAnswerDetail> details) {
        if (details == null || details.isEmpty()) return "no_essay";
        boolean hasEssay = false;
        boolean allGraded = true;
        for (ExamAnswerDetail d : details) {
            if (d.getQuestion() != null && "essay".equals(d.getQuestion().getType())) {
                hasEssay = true;
                if (d.getEssayScore() == null) allGraded = false;
            }
        }
        return hasEssay ? (allGraded ? "graded" : "pending") : "no_essay";
    }

    public ExamResultResponse toResultResponse(ExamResult result) {
        String gradingStatus = computeGradingStatus(result.getAnswerDetails());

        return ExamResultResponse.builder()
                .id(result.getId())
                .examId(result.getExam().getId())
                .examTitle(result.getExam().getTitle())
                .studentId(result.getStudent().getId())
                .studentName(result.getStudent().getUser().getName())
                .score(result.getScore())
                .correctAnswers(result.getCorrectAnswers())
                .totalQuestions(result.getExam().getTotalQuestions())
                .timeSpent(result.getTimeSpent())
                .passed(result.getPassed())
                .submittedAt(result.getSubmittedAt())
                .gradingStatus(gradingStatus)
                .scoreHistory(result.getScoreHistory())
                .build();
    }

    public ExamAnswerDetailResponse toAnswerDetailResponse(ExamAnswerDetail detail) {
        return ExamAnswerDetailResponse.builder()
                .id(detail.getId())
                .questionId(detail.getQuestion().getId())
                .questionType(detail.getQuestion().getType())
                .selectedAnswer(detail.getSelectedAnswer())
                .correctAnswer(detail.getCorrectAnswer())
                .isCorrect(detail.getIsCorrect())
                .essayScore(detail.getEssayScore())
                .maxPoints(detail.getQuestion().getPoints())
                .teacherComment(detail.getTeacherComment())
                .build();
    }

    public GradeResponse toGradeResponse(Grade grade) {
        ClassEntity cls = grade.getClassEntity();
        return GradeResponse.builder()
                .id(grade.getId())
                .studentId(grade.getStudent().getId())
                .studentName(grade.getStudent().getUser().getName())
                .classId(cls.getId())
                .className(cls.getName())
                .subjectName(cls.getSubject().getName())
                .avgScore(grade.getAvgScore())
                .trend(grade.getTrend().name())
                .attendanceRate(grade.getAttendanceRate())
                .comment(grade.getComment())
                .updatedAt(grade.getUpdatedAt())
                // Enriched fields
                .classStatus(cls.getStatus() != null ? cls.getStatus().name() : "active")
                .teacherName(cls.getTeacher() != null && cls.getTeacher().getUser() != null
                        ? cls.getTeacher().getUser().getName() : "")
                .build();
    }

    /** Tạo enriched GradeResponse kèm danh sách điểm bài thi */
    public GradeResponse toGradeResponseEnriched(Grade grade, java.util.List<ExamScoreItem> examScores) {
        GradeResponse resp = toGradeResponse(grade);
        resp.setExamScores(examScores);
        return resp;
    }

    /** Convert ExamResult entity → ExamScoreItem DTO (score converted 0-100 → 0-10) */
    public ExamScoreItem toExamScoreItem(ExamResult result) {
        // ExamResult stores score on 0-100 scale, FE expects 0-10
        java.math.BigDecimal score10 = result.getScore() != null
                ? result.getScore().divide(java.math.BigDecimal.TEN, 2, java.math.RoundingMode.HALF_UP)
                : java.math.BigDecimal.ZERO;

        String gradingStatus = computeGradingStatus(result.getAnswerDetails());

        return ExamScoreItem.builder()
                .examId(result.getExam().getId())
                .examTitle(result.getExam().getTitle())
                .score(score10)
                .passed(result.getPassed())
                .date(result.getExam().getEndTime() != null
                        ? result.getExam().getEndTime().toString() : null)
                .submittedAt(result.getSubmittedAt() != null
                        ? result.getSubmittedAt().toString() : null)
                .gradingStatus(gradingStatus)
                .build();
    }

    public LeaveRequestResponse toLeaveResponse(LeaveRequest lr) {
        var session = lr.getSession();
        var classEntity = session != null ? session.getClassEntity() : null;

        return LeaveRequestResponse.builder()
                .id(lr.getId())
                .requesterId(lr.getRequester().getId())
                .requesterName(lr.getRequester().getName())
                .requesterType(lr.getRequesterType().name())
                .sessionId(session != null ? session.getId() : null)
                .sessionDate(session != null ? session.getDate().toString() : null)
                .className(classEntity != null ? classEntity.getName() : null)
                .startTime(session != null ? session.getStartTime().toString() : null)
                .endTime(session != null ? session.getEndTime().toString() : null)
                .type(lr.getType().name())
                .reason(lr.getReason())
                .status(lr.getStatus().name())
                .reviewedBy(lr.getReviewedBy() != null ? lr.getReviewedBy().getName() : null)
                .reviewedAt(lr.getReviewedAt())
                .rejectReason(lr.getRejectReason())
                .createdAt(lr.getCreatedAt())
                .build();
    }

    public RescheduleRequestResponse toRescheduleResponse(RescheduleRequest rr) {
        return RescheduleRequestResponse.builder()
                .id(rr.getId())
                .teacherId(rr.getTeacher().getId())
                .teacherName(rr.getTeacher().getUser().getName())
                .classId(rr.getClassEntity().getId())
                .className(rr.getClassEntity().getName())
                .sessionId(rr.getSession() != null ? rr.getSession().getId() : null)
                .type(rr.getType().name())
                .originalDate(rr.getOriginalDate().toString())
                .originalTime(rr.getOriginalTime())
                .requestedDate(rr.getRequestedDate() != null ? rr.getRequestedDate().toString() : null)
                .requestedTime(rr.getRequestedTime())
                .requestedEndTime(rr.getRequestedEndTime())
                .reason(rr.getReason())
                .status(rr.getStatus().name())
                .reviewedBy(rr.getReviewedBy())
                .reviewedAt(rr.getReviewedAt())
                .rejectReason(rr.getRejectReason())
                .createdAt(rr.getCreatedAt())
                .build();
    }
}
