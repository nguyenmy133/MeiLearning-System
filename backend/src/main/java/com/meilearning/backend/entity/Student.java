/**

 * Entity: Học viên â€” má»Ÿ rá»™ng từ User (1:1 qua user_id).

 * Chá»©a thông tin nghiá»‡p vá»¥ riªng cá»§a học viên.

 */

package com.meilearning.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.meilearning.backend.entity.enums.Gender;
import com.meilearning.backend.entity.enums.StudentStatus;
import com.meilearning.backend.entity.enums.TuitionStatus;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "parent_phone", length = 20)
    private String parentPhone;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Column(length = 10)
    private String grade;

    @Column(length = 500)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StudentStatus status = StudentStatus.active;

    @Enumerated(EnumType.STRING)
    @Column(name = "tuition_status", nullable = false, length = 20)
    @Builder.Default
    private TuitionStatus tuitionStatus = TuitionStatus.pending;

    @Column(name = "enroll_date")
    private LocalDate enrollDate;

    @Column(name = "drop_date")
    private LocalDate dropDate;

    @Column(name = "drop_reason", length = 255)
    private String dropReason;

    @Column(name = "drop_notes", columnDefinition = "TEXT")
    private String dropNotes;

    // â”€â”€ Relationships â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @OneToMany(mappedBy = "student")
    @Builder.Default
    private List<ClassEnrollment> enrollments = new ArrayList<>();

    @OneToMany(mappedBy = "student")
    @Builder.Default
    private List<AttendanceRecord> attendanceRecords = new ArrayList<>();

    @OneToMany(mappedBy = "student")
    @Builder.Default
    private List<TuitionInvoice> tuitionInvoices = new ArrayList<>();

    @OneToMany(mappedBy = "student")
    @Builder.Default
    private List<ExamResult> examResults = new ArrayList<>();

    @OneToMany(mappedBy = "student")
    @Builder.Default
    private List<Grade> grades = new ArrayList<>();

}
