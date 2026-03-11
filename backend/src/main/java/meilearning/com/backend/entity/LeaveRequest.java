/**
 * Entity: Xin nghỉ phép — Student hoặc Teacher xin nghỉ buổi học.
 * requester_id trỏ đến users(id), requester_type xác định role.
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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import meilearning.com.backend.entity.enums.LeaveType;
import meilearning.com.backend.entity.enums.RequestStatus;
import meilearning.com.backend.entity.enums.RequesterType;

import java.time.Instant;

@Entity
@Table(name = "leave_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private ClassSession session;

    @Enumerated(EnumType.STRING)
    @Column(name = "requester_type", nullable = false, length = 20)
    private RequesterType requesterType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private LeaveType type;

    @Column(nullable = false, length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RequestStatus status = RequestStatus.pending;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;
}
