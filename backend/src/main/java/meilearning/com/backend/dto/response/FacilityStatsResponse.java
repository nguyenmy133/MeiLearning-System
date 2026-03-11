package meilearning.com.backend.dto.response;

import lombok.*;

@Getter @Builder @AllArgsConstructor
public class FacilityStatsResponse {
    private long totalFacilities;
    private long totalRooms;
    private long totalCapacity;
    private long availableRooms;
    private long activeFacilities;
}
