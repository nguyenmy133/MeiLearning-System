/**

 * Entity: Kết quả thi â€” mỗi student nộp bài 1 lần per exam.

 * Unique constraint: (exam_id, student_id).

 */

package com.meilearning.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.Instant;
@Entity
@Table(name = "exam_results", uniqueConstraints = {
        @UniqueConstraint(name = "uk_exam_result_exam_student", columnNames = { "exam_id", "student_id" })
})

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResult extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    /** Điểm 0-100 */

    @Column(precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "correct_answers")
    @Builder.Default
    private Integer correctAnswers = 0;

    /** Thá»i gian làm bài (phút) */

    @Column(name = "time_spent")
    private Integer timeSpent;

    @Builder.Default
    private Boolean passed = false;

    @Column(name = "submitted_at")
    private Instant submittedAt;

}
