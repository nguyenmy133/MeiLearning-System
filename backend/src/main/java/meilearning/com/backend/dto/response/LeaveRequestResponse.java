package meilearning.com.backend.dto.response;

import lombok.*;
import java.time.Instant;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaveRequestResponse {
    private Long id;
    private Long requesterId;
    private String requesterName;
    private String requesterType;
    private Long sessionId;
    private String sessionDate;
    private String type;
    private String reason;
    private String status;
    private String reviewedBy;
    private Instant reviewedAt;
    private String rejectReason;
    private Instant createdAt;
}
