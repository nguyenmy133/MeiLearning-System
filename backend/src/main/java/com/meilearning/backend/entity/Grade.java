/**
 * Entity: Äiá»ƒm tá»•ng káº¿t â€” 1 record per (student, class).
 * Tá»•ng há»£p tá»« exam results + attendance.
 */
package com.meilearning.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import com.meilearning.backend.entity.enums.GradeTrend;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "grades", uniqueConstraints = {
        @UniqueConstraint(name = "uk_grade_student_class", columnNames = { "student_id", "class_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grade extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    /** Äiá»ƒm trung bĂ¬nh 0-10 */
    @Column(name = "avg_score", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal avgScore = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    @Builder.Default
    private GradeTrend trend = GradeTrend.stable;

    /** Tá»· lá»‡ cĂ³ máº·t 0-100 */
    @Column(name = "attendance_rate")
    @Builder.Default
    private Integer attendanceRate = 0;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "comment_updated_at")
    private Instant commentUpdatedAt;
}
