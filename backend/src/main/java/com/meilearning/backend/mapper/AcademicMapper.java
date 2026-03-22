package com.meilearning.backend.mapper;

import org.springframework.stereotype.Component;
import com.meilearning.backend.dto.response.*;
import com.meilearning.backend.entity.*;
@Component
public class AcademicMapper {

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
                .status(exam.getStatus().name())
                .classIds(exam.getClasses().stream().map(ClassEntity::getId).toList())
                .classNames(exam.getClasses().stream().map(ClassEntity::getName).toList())
                .submittedCount(submittedCount)
                .avgScore(avgScore)
                .createdAt(exam.getCreatedAt())
                .totalStudents(totalStudents)
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


    public ExamResultResponse toResultResponse(ExamResult result) {
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
                .build();
    }

    public ExamAnswerDetailResponse toAnswerDetailResponse(ExamAnswerDetail detail) {
        return ExamAnswerDetailResponse.builder()
                .questionId(detail.getQuestion().getId())
                .selectedAnswer(detail.getSelectedAnswer())
                .correctAnswer(detail.getCorrectAnswer())
                .isCorrect(detail.getIsCorrect())
                .build();
    }

    public GradeResponse toGradeResponse(Grade grade) {
        return GradeResponse.builder()
                .id(grade.getId())
                .studentId(grade.getStudent().getId())
                .studentName(grade.getStudent().getUser().getName())
                .classId(grade.getClassEntity().getId())
                .className(grade.getClassEntity().getName())
                .subjectName(grade.getClassEntity().getSubject().getName())
                .avgScore(grade.getAvgScore())
                .trend(grade.getTrend().name())
                .attendanceRate(grade.getAttendanceRate())
                .comment(grade.getComment())
                .updatedAt(grade.getUpdatedAt())
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
