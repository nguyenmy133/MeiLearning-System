/**

 * Entity: Yêu cầu dá»i lịch / hủy buổi â€” Teacher gửi, Admin duyệt.

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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.meilearning.backend.entity.enums.RequestStatus;
import com.meilearning.backend.entity.enums.RescheduleType;
import java.time.Instant;
import java.time.LocalDate;
@Entity
@Table(name = "reschedule_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescheduleRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private ClassSession session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RescheduleType type;

    @Column(name = "original_date", nullable = false)
    private LocalDate originalDate;

    @Column(name = "original_time", length = 20)
    private String originalTime;

    @Column(name = "requested_date")
    private LocalDate requestedDate;

    @Column(name = "requested_time", length = 20)
    private String requestedTime;

    @Column(name = "requested_end_time", length = 20)
    private String requestedEndTime;

    @Column(nullable = false, length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RequestStatus status = RequestStatus.pending;

    @Column(name = "reviewed_by", length = 100)
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

}
