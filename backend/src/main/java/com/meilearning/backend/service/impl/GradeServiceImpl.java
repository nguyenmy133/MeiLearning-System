package com.meilearning.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.dto.request.UpdateGradeRequest;
import com.meilearning.backend.dto.response.ExamScoreItem;
import com.meilearning.backend.dto.response.GradeResponse;
import com.meilearning.backend.dto.response.GradeStatsResponse;
import com.meilearning.backend.entity.*;
import com.meilearning.backend.entity.enums.GradeTrend;
import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.mapper.AcademicMapper;
import com.meilearning.backend.repository.*;
import com.meilearning.backend.service.GradeService;
import com.meilearning.backend.service.NotificationDispatcher;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class GradeServiceImpl implements GradeService {

    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final ExamResultRepository examResultRepository;
    private final ClassEnrollmentRepository enrollmentRepository;
    private final AcademicMapper mapper;
    private final NotificationDispatcher notificationDispatcher;

    // ── READ: Grades by class ────────────────────────────────────────────────
    // Dynamically builds grades from class enrollments + exam results.
    // If a Grade record exists (teacher added comment / manual override), merge it.

    @Override
    @Transactional(readOnly = true)
    public List<GradeResponse> getByClass(Long classId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classId));

        List<ClassEnrollment> enrollments = enrollmentRepository.findByClassEntityId(classId);
        List<GradeResponse> results = new ArrayList<>();

        for (ClassEnrollment enrollment : enrollments) {
            Student student = enrollment.getStudent();
            results.add(buildGradeResponse(student, classEntity));
        }
        return results;
    }

    // ── READ: Grades for a student ───────────────────────────────────────────
    // Shows all classes the student is enrolled in, with their exam scores.

    @Override
    @Transactional(readOnly = true)
    public List<GradeResponse> getByStudent(Long studentId) {
        List<ClassEnrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        List<GradeResponse> results = new ArrayList<>();

        for (ClassEnrollment enrollment : enrollments) {
            ClassEntity classEntity = enrollment.getClassEntity();
            Student student = enrollment.getStudent();
            results.add(buildGradeResponse(student, classEntity));
        }
        return results;
    }

    /**
     * Build a single GradeResponse by aggregating:
     * 1. ExamResult records (per student per class) → examScores[], computed avgScore
     * 2. Grade record (if exists) → comment, manual overrides
     * 3. ClassEntity → classStatus, teacherName, subjectName
     */
    private GradeResponse buildGradeResponse(Student student, ClassEntity classEntity) {
        // 1. Get exam results for this student in this class
        List<ExamResult> examResults = examResultRepository
                .findByStudentIdAndClassId(student.getId(), classEntity.getId());

        List<ExamScoreItem> examScores = examResults.stream()
                .map(mapper::toExamScoreItem)
                .toList();

        // 2. Compute average score from exam results (score is 0-100, convert to 0-10)
        double avgScore = 0;
        if (!examResults.isEmpty()) {
            avgScore = examResults.stream()
                    .filter(er -> er.getScore() != null)
                    .mapToDouble(er -> er.getScore().doubleValue() / 10.0) // 0-100 → 0-10
                    .average()
                    .orElse(0.0);
        }

        // 3. Load Grade record if it exists (for comment, manual attendance, trend)
        Optional<Grade> existingGrade = gradeRepository
                .findByStudentIdAndClassEntityId(student.getId(), classEntity.getId());

        String comment = existingGrade.map(Grade::getComment).orElse(null);
        Integer attendanceRate = existingGrade.map(Grade::getAttendanceRate).orElse(0);
        String trend = existingGrade.map(g -> g.getTrend().name()).orElse("stable");
        Instant updatedAt = existingGrade.map(Grade::getUpdatedAt).orElse(null);

        // If grade has manual avgScore override, use it; otherwise use computed
        BigDecimal finalAvg = existingGrade
                .filter(g -> g.getAvgScore() != null && g.getAvgScore().compareTo(BigDecimal.ZERO) > 0)
                .map(Grade::getAvgScore)
                .orElse(BigDecimal.valueOf(avgScore).setScale(2, RoundingMode.HALF_UP));

        String teacherName = "";
        if (classEntity.getTeacher() != null && classEntity.getTeacher().getUser() != null) {
            teacherName = classEntity.getTeacher().getUser().getName();
        }
        String classStatus = classEntity.getStatus() != null ? classEntity.getStatus().name() : "active";
        String subjectName = classEntity.getSubject() != null ? classEntity.getSubject().getName() : "";

        return GradeResponse.builder()
                .id(existingGrade.map(Grade::getId).orElse(null))
                .studentId(student.getId())
                .studentName(student.getUser() != null ? student.getUser().getName() : "")
                .classId(classEntity.getId())
                .className(classEntity.getName())
                .subjectName(subjectName)
                .avgScore(finalAvg)
                .trend(trend)
                .attendanceRate(attendanceRate)
                .comment(comment)
                .updatedAt(updatedAt)
                // Enriched fields
                .examScores(examScores)
                .classStatus(classStatus)
                .teacherName(teacherName)
                .build();
    }

    // ── UPDATE: Grade (manual override by teacher) ───────────────────────────

    @Override
    public GradeResponse update(UpdateGradeRequest req) {
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

    // ── STATS: Grade statistics by class ─────────────────────────────────────
    // Now computed from dynamic grade responses (not just Grade table).

    @Override
    @Transactional(readOnly = true)
    public GradeStatsResponse getStatsByClass(Long classId) {
        List<GradeResponse> grades = getByClass(classId);
        int total = grades.size();

        if (total == 0) {
            return GradeStatsResponse.builder()
                    .totalStudents(0)
                    .averageScore(BigDecimal.ZERO)
                    .passRate(0)
                    .averageAttendance(0)
                    .avg(0)
                    .pass(0)
                    .fail(0)
                    .total(0)
                    .build();
        }

        double avgScore = grades.stream()
                .filter(g -> g.getAvgScore() != null)
                .mapToDouble(g -> g.getAvgScore().doubleValue())
                .average().orElse(0.0);

        long passCount = grades.stream()
                .filter(g -> g.getAvgScore() != null && g.getAvgScore().doubleValue() >= 5.0)
                .count();

        double avgAttendance = grades.stream()
                .filter(g -> g.getAttendanceRate() != null)
                .mapToInt(GradeResponse::getAttendanceRate)
                .average().orElse(0.0);

        BigDecimal avgScoreBD = BigDecimal.valueOf(avgScore).setScale(2, RoundingMode.HALF_UP);

        return GradeStatsResponse.builder()
                .totalStudents(total)
                .averageScore(avgScoreBD)
                .passRate(total > 0 ? (double) passCount / total * 100 : 0)
                .averageAttendance(avgAttendance)
                .avg(avgScore)
                .pass((int) passCount)
                .fail(total - (int) passCount)
                .total(total)
                .build();
    }

    // ── UPDATE: Comment only ─────────────────────────────────────────────────

    @Override
    public GradeResponse updateComment(Long classId, Long studentId, String comment) {
        Grade grade = gradeRepository.findByStudentIdAndClassEntityId(studentId, classId)
                .orElseGet(() -> {
                    Student student = studentRepository.findById(studentId)
                            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
                    ClassEntity classEntity = classRepository.findById(classId)
                            .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
                    return Grade.builder().student(student).classEntity(classEntity).build();
                });

        grade.setComment(comment);
        grade.setCommentUpdatedAt(Instant.now());
        grade = gradeRepository.save(grade);

        // Notify student: teacher has updated their comment
        if (grade.getStudent() != null && grade.getStudent().getUser() != null) {
            String className = grade.getClassEntity() != null
                    ? grade.getClassEntity().getName() : "";
            notificationDispatcher.notifyWithEmail(
                    grade.getStudent().getUser(),
                    "grade_comment",
                    "Nhận xét mới từ giáo viên",
                    "Giáo viên đã cập nhật nhận xét cho bạn trong lớp " + className + "."
            );
        }

        return mapper.toGradeResponse(grade);
    }
}
