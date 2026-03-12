/**
 * Entity: Lá»›p há»c.
 * schedule Ä‘Æ°á»£c lÆ°u dáº¡ng JSON column (SessionSlot[]).
 *
 * LÆ°u Ă½: TĂªn class Java lĂ  ClassEntity vĂ¬ "Class" lĂ  reserved word trong Java.
 * Table name váº«n lĂ  "classes".
 */
package com.meilearning.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.meilearning.backend.entity.enums.ClassStatus;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "classes", indexes = {
        @Index(name = "idx_classes_subject", columnList = "subject_id"),
        @Index(name = "idx_classes_teacher", columnList = "teacher_id"),
        @Index(name = "idx_classes_room", columnList = "room_id"),
        @Index(name = "idx_classes_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassEntity extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @Column(name = "max_students", nullable = false)
    @Builder.Default
    private Integer maxStudents = 30;

    @Column(name = "price_per_session", nullable = false)
    private Long pricePerSession;

    /**
     * Lá»‹ch há»c dáº¡ng JSON: [{"weekday":1,"startTime":"18:00","endTime":"20:00"},
     * ...]
     */
    @Column(columnDefinition = "JSON")
    private String schedule;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ClassStatus status = ClassStatus.upcoming;

    // â”€â”€ Relationships â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @OneToMany(mappedBy = "classEntity")
    @Builder.Default
    private List<ClassEnrollment> enrollments = new ArrayList<>();

    @OneToMany(mappedBy = "classEntity")
    @Builder.Default
    private List<ClassSession> sessions = new ArrayList<>();

    @OneToMany(mappedBy = "classEntity")
    @Builder.Default
    private List<TuitionInvoice> tuitionInvoices = new ArrayList<>();

    @ManyToMany(mappedBy = "classes")
    @Builder.Default
    private List<Exam> exams = new ArrayList<>();

    @OneToMany(mappedBy = "classEntity")
    @Builder.Default
    private List<Grade> grades = new ArrayList<>();

    @OneToMany(mappedBy = "classEntity")
    @Builder.Default
    private List<RescheduleRequest> rescheduleRequests = new ArrayList<>();
}
