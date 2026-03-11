package meilearning.com.backend.mapper;

import org.springframework.stereotype.Component;
import meilearning.com.backend.dto.response.*;
import meilearning.com.backend.entity.*;

@Component
public class AcademicMapper {

    public ExamResponse toExamResponse(Exam exam, int submittedCount, double avgScore) {
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
                .submittedCount(submittedCount)
                .avgScore(avgScore)
                .createdAt(exam.getCreatedAt())
                .build();
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
                .timeSpent(result.getTimeSpent())
                .passed(result.getPassed())
                .submittedAt(result.getSubmittedAt())
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
        return LeaveRequestResponse.builder()
                .id(lr.getId())
                .requesterId(lr.getRequester().getId())
                .requesterName(lr.getRequester().getName())
                .requesterType(lr.getRequesterType().name())
                .sessionId(lr.getSession() != null ? lr.getSession().getId() : null)
                .sessionDate(lr.getSession() != null ? lr.getSession().getDate().toString() : null)
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
                .reason(rr.getReason())
                .status(rr.getStatus().name())
                .reviewedBy(rr.getReviewedBy())
                .reviewedAt(rr.getReviewedAt())
                .rejectReason(rr.getRejectReason())
                .createdAt(rr.getCreatedAt())
                .build();
    }
}
