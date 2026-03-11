/**
 * Entity: Điểm danh — record điểm danh từng học viên trong từng buổi.
 * Unique constraint: mỗi student chỉ điểm danh 1 lần/buổi.
 */
package meilearning.com.backend.entity;

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
import meilearning.com.backend.entity.enums.AttendanceStatus;
import meilearning.com.backend.entity.enums.CheckInMethod;

import java.time.LocalTime;

@Entity
@Table(name = "attendance_records", uniqueConstraints = {
        @UniqueConstraint(name = "uk_attendance_session_student", columnNames = { "session_id", "student_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ClassSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;

    @Column(name = "check_in_time")
    private LocalTime checkInTime;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private CheckInMethod method;

    @Column(columnDefinition = "TEXT")
    private String note;
}
