package com.meilearning.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class LeaveStatsResponse {
    private long total;
    private long pending;
    private long approved;
    private long rejected;
}
