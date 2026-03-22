package com.meilearning.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity: chi tiết từng câu trả lời của học viên trong bài thi.
 * Mỗi ExamResult có nhiều ExamAnswerDetail.
 */
@Entity
@Table(name = "exam_answer_details")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExamAnswerDetail extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_result_id", nullable = false)
    private ExamResult examResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private ExamQuestion question;

    /** Đáp án user đã chọn: "a", "b", "c", "d" */
    @Column(name = "selected_answer", length = 10)
    private String selectedAnswer;

    /** Đáp án đúng (copy từ ExamQuestion tại thời điểm submit) */
    @Column(name = "correct_answer", length = 10)
    private String correctAnswer;

    @Column(name = "is_correct", nullable = false)
    @Builder.Default
    private Boolean isCorrect = false;
}
