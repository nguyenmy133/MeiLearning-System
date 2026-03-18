package com.meilearning.backend.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateSessionRequest {
    private String date;        // "YYYY-MM-DD"
    private String startTime;   // "HH:mm"
    private String endTime;     // "HH:mm"
    private String type;        // "makeup" or "extra"
    private String notes;
    private Long roomId;        // FK → Room.id (override for this session)
}
