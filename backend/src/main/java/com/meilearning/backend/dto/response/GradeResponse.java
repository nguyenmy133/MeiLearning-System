package com.meilearning.backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class GradeResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long classId;
    private String className;
    private String subjectName;
    private BigDecimal avgScore;
    private String trend;
    private Integer attendanceRate;
    private String comment;
    private Instant updatedAt;

    // ── Enriched fields ──────────────────────────────────
    /** Danh sách điểm từng bài thi (aggregate từ ExamResult) */
    private List<ExamScoreItem> examScores;
    /** Status của lớp: upcoming / active / completed */
    private String classStatus;
    /** Tên giáo viên phụ trách lớp */
    private String teacherName;
}
