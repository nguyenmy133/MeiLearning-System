package com.meilearning.backend.dto.response;

import lombok.*;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ScheduleResponse {
    private String startDate;
    private String endDate;
    private String view;   // day, week, month
    private List<ClassSessionResponse> sessions;
    private int totalSessions;
}
