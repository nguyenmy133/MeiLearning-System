package com.meilearning.backend.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity: câu hỏi của bài thi.
 * Lưu options dạng JSON column (danh sách đáp án A,B,C,D).
 */
@Entity
@Table(name = "exam_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExamQuestion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    /** Thứ tự câu hỏi trong đề thi */
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    /** Loại câu hỏi: multiple-choice | essay */
    @Column(nullable = false, length = 30)
    @Builder.Default
    private String type = "multiple-choice";

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    /**
     * Lưu dưới dạng JSON: [{"id":"a","text":"..."}, ...]
     * Chỉ áp dụng cho loại multiple-choice.
     */
    @Column(columnDefinition = "TEXT")
    private String options;

    /** ID đáp án đúng (khớp với id trong options). VD: "b" */
    @Column(name = "correct_answer", length = 10)
    private String correctAnswer;

    @Column(nullable = false)
    @Builder.Default
    private Integer points = 1;

    @Column(columnDefinition = "TEXT")
    private String explanation;
}
