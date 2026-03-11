package meilearning.com.backend.dto.response;

import lombok.*;
import java.time.Instant;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class FacilityResponse {
    private Long id;
    private String name;
    private String address;
    private String phone;
    private String manager;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}
