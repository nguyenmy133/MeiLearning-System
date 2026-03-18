/**

 * Entity: Buá»•i học cá»¥ thể â€” được generate từ Class.schedule hoặc tạo thủ công (b¹/thêm).

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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.meilearning.backend.entity.enums.SessionStatus;
import com.meilearning.backend.entity.enums.SessionType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
@Entity
@Table(name = "class_sessions", indexes = {
        @Index(name = "idx_sessions_class", columnList = "class_id"),
        @Index(name = "idx_sessions_date", columnList = "date"),
        @Index(name = "idx_sessions_class_date", columnList = "class_id, date")
})

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SessionStatus status = SessionStatus.upcoming;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SessionType type = SessionType.regular;

    @Column(columnDefinition = "TEXT")
    private String notes;

    /** Optional: override room for this specific session (null = use class default) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_override_id")
    private Room roomOverride;

    // â”€â”€ Relationships â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @OneToMany(mappedBy = "session")
    @Builder.Default
    private List<AttendanceRecord> attendanceRecords = new ArrayList<>();

    @OneToMany(mappedBy = "session")
    @Builder.Default
    private List<LeaveRequest> leaveRequests = new ArrayList<>();

    @OneToMany(mappedBy = "session")
    @Builder.Default
    private List<RescheduleRequest> rescheduleRequests = new ArrayList<>();

}
