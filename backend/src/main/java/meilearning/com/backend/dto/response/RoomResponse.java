package meilearning.com.backend.dto.response;

import lombok.*;
import java.time.Instant;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RoomResponse {
    private Long id;
    private String name;
    private Long facilityId;
    /** Denormalized facility name for display */
    private String facilityName;
    private Integer capacity;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}
