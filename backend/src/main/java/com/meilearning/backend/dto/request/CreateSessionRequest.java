package com.meilearning.backend.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateSessionRequest {
    private Long classId;
    private String type;        // "makeup" or "extra"
    private String date;        // "YYYY-MM-DD"
    private String startTime;   // "HH:mm"
    private String endTime;     // "HH:mm"
    private String notes;
}
